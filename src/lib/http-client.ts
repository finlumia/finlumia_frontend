/**
 * Cliente HTTP minimalista.
 * Tokens nunca são lidos/escritos aqui — vivem em cookies HttpOnly gerenciados
 * pelo servidor. O browser os inclui automaticamente (credentials: "same-origin").
 */

const REQUEST_TIMEOUT_MS = 8000;

// Mantido em sincronia com PROTECTED_PREFIX em middleware.ts.
const PROTECTED_PREFIX = "/dashboard";

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  if (init.signal) return fetch(input, init);

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

/** Só faz parse quando há corpo de fato — vários endpoints respondem 200/204 sem conteúdo. */
async function parseBody<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { headers: extra = {}, ...init } = options;

  const res = await fetchWithTimeout(url, {
    ...init,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...extra },
  });

  // 401 já foi tratado pelo proxy (refresh automático).
  // Se chegar aqui significa que o refresh também falhou.
  // Só força redirect se a página atual for protegida (/dashboard/**) — em
  // páginas públicas (landing, login, etc.) um 401 do AuthProvider checando
  // /me apenas significa "visitante sem sessão", não uma sessão expirada.
  //
  // IMPORTANTE: nem todo 401 significa sessão expirada — ex.: /api/auth/login
  // retorna 401 para credenciais inválidas, sem nenhuma sessão em jogo.
  // O corpo da resposta sempre traz a mensagem correta (proxy e rotas de auth
  // definem "message" explicitamente), então ela tem prioridade sobre o texto
  // genérico de fallback.
  if (res.status === 401) {
    const payload = await parseBody<{ message?: string } | null>(res).catch(() => null);
    if (window.location.pathname.startsWith(PROTECTED_PREFIX)) {
      window.location.replace("/login");
    }
    throw new Error(payload?.message ?? "Sessão expirada. Faça login novamente.");
  }

  if (!res.ok) {
    const payload = await parseBody(res).catch(() => null);
    throw payload ?? { message: `Erro ${res.status}: ${res.statusText}` };
  }

  return parseBody<T>(res);
}

export const http = {
  get:    <T>(url: string, opts?: RequestOptions) =>
    request<T>(url, { ...opts, method: "GET" }),
  post:   <T>(url: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(url, { ...opts, method: "POST",   body: body != null ? JSON.stringify(body) : undefined }),
  put:    <T>(url: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(url, { ...opts, method: "PUT",    body: body != null ? JSON.stringify(body) : undefined }),
  patch:  <T>(url: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(url, { ...opts, method: "PATCH",  body: body != null ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(url, { ...opts, method: "DELETE", body: body != null ? JSON.stringify(body) : undefined }),
};
