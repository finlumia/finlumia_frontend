import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const IDENTIFY_BASE =
  process.env.SERVICE_IDENTIFICATION_URL ?? "http://localhost:28083";

const BACKEND_TIMEOUT_MS = 8000;

const LoginSchema = z.object({
  email:    z.string().email({ message: "E-mail inválido" }),
  password: z.string().min(1, { message: "Senha obrigatória" }),
  remember: z.boolean().optional(),
});

function authCookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path:     "/",
    maxAge,
  };
}

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

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ message: "Corpo da requisição inválido" }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  let backendRes: Response;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);
    try {
      backendRes = await fetch(`${IDENTIFY_BASE}/api/identify/token`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(parsed.data),
        signal:  controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      { message: timedOut ? "Serviço de autenticação demorou para responder" : "Serviço de autenticação indisponível" },
      { status: timedOut ? 504 : 502 },
    );
  }

  if (!backendRes.ok) {
    const err = await backendRes.json().catch(() => null) as Record<string, unknown> | null;
    const message = (err?.message ?? err?.mensage ?? "Credenciais inválidas") as string;
    return NextResponse.json({ message }, { status: backendRes.status });
  }

  let data: Record<string, unknown>;
  try {
    data = await backendRes.json();
  } catch {
    return NextResponse.json({ message: "Resposta inválida do serviço de autenticação" }, { status: 502 });
  }

  const accessToken  = (data.accessToken  ?? data.access_token)  as string | undefined;
  const refreshToken = (data.refreshToken ?? data.refresh_token) as string | undefined;

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ message: "Serviço de autenticação retornou resposta incompleta" }, { status: 502 });
  }

  const expiresIn = (data.expiresIn ?? data.expires_in ?? 900) as number;

  const response = NextResponse.json({ user: data.user ?? null });
  response.cookies.set("finlumia_access",  accessToken,  authCookieOpts(expiresIn));
  response.cookies.set("finlumia_refresh", refreshToken, authCookieOpts(30 * 24 * 60 * 60));
  return response;
}
