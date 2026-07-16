import type { Metadata } from "next";
import { headers } from "next/headers";
import { AppProviders } from "./providers";
import "@/shared/styles/globals.css";

export const metadata: Metadata = {
  title: "Finlumia",
  description: "Clareza financeira para decisões mais inteligentes",
  icons: {
    icon: "/assets/icone_finlumia.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lê headers() para forçar renderização dinâmica por requisição: é isso que
  // permite o Next.js carimbar o nonce da CSP (gerado no middleware) nos seus
  // próprios scripts inline de hidratação. Sem isso a página pode ser tratada
  // como estática e esses scripts saem sem nonce, sendo bloqueados pela CSP.
  await headers();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
