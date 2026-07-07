import { NextRequest, NextResponse } from "next/server";

const PROXY_TIMEOUT_MS = 8000;

// SERVICE_* são server-only — nunca expostas ao browser.
const BACKENDS: Record<string, string> = {
  identify:     process.env.SERVICE_IDENTIFICATION_URL ?? "http://localhost:28083",
  movement:     process.env.SERVICE_MOVIMENTATION_URL  ?? "http://localhost:28084",
  document:     process.env.SERVICE_DOCUMENT_URL       ?? "http://localhost:28085",
  configurator: process.env.SERVICE_CONFIGURATOR_URL   ?? "http://localhost:28081",
  support:      process.env.SERVICE_SUPPORT_URL        ?? "http://localhost:28082",
};

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const HOP_BY_HOP = new Set([
  "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
  "te", "trailers", "transfer-encoding", "upgrade", "host", "cookie",
]);

const STRIP_RESPONSE = new Set(["www-authenticate"]);

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("host") ?? "";
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function buildForwardHeaders(req: NextRequest, accessToken: string | null): Headers {
  const h = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) h.set(key, value);
  });
  if (accessToken) h.set("Authorization", `Bearer ${accessToken}`);
  return h;
}

async function fetchUpstream(url: string, method: string, headers: Headers, body: ArrayBuffer | undefined): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method,
      headers,
      body: body ?? null,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

type RefreshResult = { accessToken: string; refreshToken: string | null };

// O backend do identify rotaciona o refresh token a cada uso e trata reuso
// do token antigo como replay attack (revoga TODA a sessão do usuário — ver
// TokenService.AUTH_REPLAY_ATTACK). Duas requisições concorrentes que expiram
// juntas (ex.: Promise.all de uma página) leriam o mesmo cookie e, sem essa
// deduplicação, a segunda reapresentaria um token já consumido pela primeira.
// Mantemos o resultado em cache por alguns segundos após resolver — não só
// enquanto está em voo — porque o refresh do backend pode ser mais rápido
// que o delay entre as duas requisições do cliente chegarem ao proxy.
const REFRESH_CACHE_GRACE_MS = 5000;
const refreshCache = new Map<string, Promise<RefreshResult | null>>();

async function tryRefreshToken(refreshToken: string): Promise<RefreshResult | null> {
  const existing = refreshCache.get(refreshToken);
  if (existing) return existing;

  const promise = (async (): Promise<RefreshResult | null> => {
    try {
      const res = await fetch(`${BACKENDS["identify"]}/api/identify/token/refresh`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const accessToken = (data.accessToken ?? data.access_token ?? null) as string | null;
      if (!accessToken) return null;
      const newRefreshToken = (data.refreshToken ?? data.refresh_token ?? null) as string | null;
      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      return null;
    }
  })();

  refreshCache.set(refreshToken, promise);
  promise.finally(() => {
    setTimeout(() => refreshCache.delete(refreshToken), REFRESH_CACHE_GRACE_MS);
  });
  return promise;
}

function buildUpstreamResponse(upstream: Response, extraCookies?: Record<string, string>): NextResponse {
  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE.has(key.toLowerCase())) responseHeaders.set(key, value);
  });

  const res = new NextResponse(upstream.body, {
    status:     upstream.status,
    statusText: upstream.statusText,
    headers:    responseHeaders,
  });

  if (extraCookies) {
    const cookieOpts = {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path:     "/",
    };
    Object.entries(extraCookies).forEach(([name, value]) => {
      res.cookies.set(name, value, { ...cookieOpts, maxAge: name === "finlumia_access" ? 900 : 30 * 24 * 60 * 60 });
    });
  }

  return res;
}

async function proxyRequest(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  // CSRF: rejeita mutations vindas de origem diferente
  if (MUTATING_METHODS.has(req.method) && !isSameOrigin(req)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { path } = await context.params;
  const [service, ...rest] = path;
  const base = BACKENDS[service];

  if (!base) {
    return new NextResponse("Not found", { status: 404 });
  }

  const targetUrl = `${base}/${rest.join("/")}${req.nextUrl.search}`;
  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? await req.arrayBuffer()
      : undefined;

  const accessToken = req.cookies.get("finlumia_access")?.value ?? null;

  let upstream: Response;
  try {
    upstream = await fetchUpstream(targetUrl, req.method, buildForwardHeaders(req, accessToken), body);
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    // Não expõe URL interna nem nome do serviço ao browser
    return NextResponse.json(
      { message: timedOut ? "Serviço temporariamente indisponível" : "Serviço indisponível" },
      { status: timedOut ? 504 : 502 },
    );
  }

  // Token expirado → tenta refresh transparente e retentatia
  if (upstream.status === 401) {
    const refreshToken = req.cookies.get("finlumia_refresh")?.value;

    if (refreshToken) {
      const refreshed = await tryRefreshToken(refreshToken);

      if (refreshed) {
        try {
          upstream = await fetchUpstream(targetUrl, req.method, buildForwardHeaders(req, refreshed.accessToken), body);
        } catch {
          // Retorna 401 se o retry também falhar
        }

        if (upstream.status !== 401) {
          const cookies: Record<string, string> = { finlumia_access: refreshed.accessToken };
          if (refreshed.refreshToken) cookies.finlumia_refresh = refreshed.refreshToken;
          return buildUpstreamResponse(upstream, cookies);
        }
      }
    }

    // Refresh inválido ou ausente → limpa cookies e retorna 401
    const res = NextResponse.json({ message: "Sessão expirada. Faça login novamente." }, { status: 401 });
    res.cookies.set("finlumia_access",  "", { maxAge: 0, path: "/" });
    res.cookies.set("finlumia_refresh", "", { maxAge: 0, path: "/" });
    return res;
  }

  return buildUpstreamResponse(upstream);
}

export const GET     = proxyRequest;
export const POST    = proxyRequest;
export const PUT     = proxyRequest;
export const PATCH   = proxyRequest;
export const DELETE  = proxyRequest;
export const OPTIONS = proxyRequest;
