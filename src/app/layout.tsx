import type { Metadata } from "next";
import { AppProviders } from "./providers";
import "@/shared/styles/globals.css";

export const metadata: Metadata = {
  title: "Finlumia",
  description: "Clareza financeira para decisões mais inteligentes",
  icons: {
    icon: "/assets/icone_finlumia.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
