"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { useTheme } from "../../../shared/styles/theme.context";

type LegalLayoutProps = {
    title: string;
    lastUpdated: string;
    children: React.ReactNode;
};

/**
 * Layout compartilhado pelas páginas de conteúdo legal (Termos de Uso,
 * Política de Privacidade) — cabeçalho com logo, título, data de
 * atualização e um corpo de texto simples.
 */
export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
    const router = useRouter();
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const border = f.colors.border.default;
    const muted = f.colors.text.muted;
    const primary = f.colors.brand.primary;

    return (
        <div style={{ minHeight: "100vh", backgroundColor: f.colors.bg.app, fontFamily: f.typography.fontFamily.base }}>
            <header style={{ borderBottom: `1px solid ${border}`, backgroundColor: isDark ? f.colors.bg.surface : "#FFFFFF" }}>
                <div style={{
                    maxWidth: "84rem", margin: "0 auto", padding: "1.2rem 1.6rem",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.2rem",
                }}>
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        style={{
                            display: "flex", alignItems: "center", gap: "0.8rem",
                            background: "none", border: "none", cursor: "pointer", padding: 0,
                        }}
                    >
                        <img src="/assets/icone_finlumia.svg" alt="" width={26} height={26} />
                        <span style={{ fontSize: "1.5rem", fontWeight: 700, color: primary, letterSpacing: "0.05em" }}>FINLUMIA</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        style={{
                            background: "none", border: `1px solid ${border}`, borderRadius: "0.7rem",
                            padding: "0.6rem 1.2rem", cursor: "pointer", fontFamily: "inherit",
                            fontSize: "1.2rem", fontWeight: 600, color: f.colors.text.secondary,
                        }}
                    >
                        Voltar
                    </button>
                </div>
            </header>

            <main style={{ maxWidth: "84rem", margin: "0 auto", padding: "clamp(2.4rem, 5vw, 4.8rem) 1.6rem" }}>
                <p style={{ fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: primary, marginBottom: "0.8rem" }}>
                    Projeto acadêmico · IHM
                </p>
                <h1 style={{ fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 800, color: f.colors.text.primary, margin: 0 }}>
                    {title}
                </h1>
                <p style={{ fontSize: "1.2rem", color: muted, marginTop: "0.8rem" }}>
                    Última atualização: {lastUpdated}
                </p>

                <div style={{
                    marginTop: "2.8rem",
                    backgroundColor: isDark ? f.colors.bg.surface : "#FFFFFF",
                    border: `1px solid ${border}`,
                    borderRadius: "1.4rem",
                    padding: "clamp(2rem, 4vw, 3.2rem)",
                    display: "flex", flexDirection: "column", gap: "2rem",
                    color: f.colors.text.secondary, fontSize: "1.15rem", lineHeight: 1.7,
                }}>
                    {children}
                </div>
            </main>

            <footer style={{ borderTop: `1px solid ${border}`, padding: "2.4rem 1.6rem", textAlign: "center" }}>
                <p style={{ fontSize: "0.95rem", color: muted }}>
                    © {new Date().getFullYear()} Finlumia · Projeto acadêmico de Interação Humano-Computador
                </p>
            </footer>
        </div>
    );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);

    return (
        <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.8rem", color: f.colors.text.primary }}>
                {title}
            </h2>
            {children}
        </section>
    );
}
