import type { NextConfig } from "next";

// Cabeçalhos estáticos (não dependem de nonce por requisição).
// A CSP dinâmica com nonce é aplicada pelo middleware.
const staticSecurityHeaders = [
  // Impede clickjacking (redundante com frame-ancestors na CSP, mas mantido para compatibilidade)
  { key: "X-Frame-Options",              value: "DENY" },
  { key: "X-Content-Type-Options",       value: "nosniff" },
  { key: "Referrer-Policy",              value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",           value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security",    value: "max-age=63072000; includeSubDomains; preload" },
  // Proteção contra ataques de timing e vazamentos cross-origin
  { key: "Cross-Origin-Opener-Policy",   value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control",       value: "off" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators:   false,

  // Não expõe código-fonte em produção
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      {
        source:  "/(.*)",
        headers: staticSecurityHeaders,
      },
    ];
  },
};

export default nextConfig;
