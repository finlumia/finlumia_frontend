import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIX = "/dashboard";
const AUTH_PAGES       = ["/login", "/register", "/forgot-password", "/reset-password"];
const ACCESS_COOKIE    = "finlumia_access";

// Verifica se o valor parece um JWT (3 segmentos base64url separados por ponto).
// Não valida assinatura — a checagem criptográfica ocorre no backend.
// Impede bypass trivial por cookie vazio ou de valor arbitrário.
function looksLikeJwt(value: string): boolean {
  const parts = value.split(".");
  return (
    parts.length === 3 &&
    parts.every((p) => p.length > 0 && /^[A-Za-z0-9_-]+$/.test(p))
  );
}

function generateNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
}

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== "production";

  return [
    "default-src 'self'",
    // Em produção: apenas scripts com o nonce gerado por esta requisição.
    // Em desenvolvimento: permite unsafe-eval para o Fast Refresh do React.
    // accounts.google.com é necessário para o botão "Continuar com Google" (Google Identity Services).
    `script-src 'self' 'nonce-${nonce}' https://accounts.google.com${isDev ? " 'unsafe-eval'" : ""}`,
    // Estilos inline são necessários pelo design system (style={{ }}).
    // accounts.google.com é necessário para a folha de estilo do botão do Google Identity Services.
    "style-src 'self' 'unsafe-inline' https://accounts.google.com",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    // Todo tráfego de API passa pelo proxy (same-origin) — exceto o Google Identity Services.
    "connect-src 'self' https://accounts.google.com",
    // O botão/One Tap do Google renderiza dentro de um iframe do próprio Google.
    "frame-src https://accounts.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookieVal     = request.cookies.get(ACCESS_COOKIE)?.value ?? "";
  const hasSession    = looksLikeJwt(cookieVal);

  if (pathname.startsWith(PROTECTED_PREFIX) && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (AUTH_PAGES.some((p) => pathname === p) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const nonce = generateNonce();

  // Injeta o nonce nas request headers para que Server Components o leiam via headers()
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // CSP por requisição (necessário para nonce funcionar)
  response.headers.set("Content-Security-Policy", buildCsp(nonce));

  return response;
}

export const config = {
  matcher: [
    // Protege dashboard e páginas de auth
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    // Aplica CSP em todas as páginas HTML (exclui static files e API routes)
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",
  ],
};
