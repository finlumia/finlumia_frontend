"use client";

import type { PropsWithChildren } from "react";
import { ThemeProvider } from "@/shared/styles/theme.context";
import { AuthProvider } from "@/contexts/auth.context";

// O nonce é lido pelo layout (Server Component) e incluído nos headers da resposta.
// Client Components não precisam dele — o Next.js aplica automaticamente aos seus
// inline scripts de hidratação quando o middleware define x-nonce na request.
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
