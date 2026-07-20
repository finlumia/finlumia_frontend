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

// Origem do storage (MinIO/S3) usada pelos anexos de suporte. O upload (PUT) e a
// exibição de imagem/vídeo acontecem direto browser→storage, com URL assinada
// devolvida pelo backend — essa é a ÚNICA chamada que sai do same-origin, então
// precisa de allowlist explícita na CSP (connect-src para o PUT via fetch/XHR,
// img-src/media-src para <img>/<video> apontando pra essa origem após o presign).
const STORAGE_ORIGIN = process.env.STORAGE_ORIGIN ?? "https://apifinlumia-storage.thiagobenevide.com";

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
    // Thumbnails de anexo (<img>) podem apontar direto pro storage após o presign.
    `img-src 'self' data: blob: ${STORAGE_ORIGIN}`,
    // Player de vídeo dos anexos (<video src>) — sem essa diretiva o CSP cai
    // em default-src 'self' e bloqueia a origem do storage.
    `media-src 'self' ${STORAGE_ORIGIN}`,
    "font-src 'self' data:",
    // Todo tráfego de API passa pelo proxy (same-origin), exceto o Google
    // Identity Services e o PUT direto ao storage no upload de anexos.
    `connect-src 'self' https://accounts.google.com ${STORAGE_ORIGIN}`,
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
  const csp   = buildCsp(nonce);

  // Injeta o nonce e a CSP nas request headers: além de permitir que Server
  // Components leiam o nonce via headers(), é assim que o Next.js descobre
  // o nonce da requisição atual para carimbar automaticamente seus próprios
  // scripts inline (payloads de streaming/hidratação do RSC). Sem a CSP na
  // request (só na response), esses scripts saem sem nonce e o navegador os
  // bloqueia, quebrando a hidratação.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // CSP por requisição na resposta (é o que o navegador de fato aplica)
  response.headers.set("Content-Security-Policy", csp);

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
