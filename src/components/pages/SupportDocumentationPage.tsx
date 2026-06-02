"use client";

import React from "react";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { useTheme } from "../../shared/styles/theme.context";

export function SupportDocumentationPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const muted = f.colors.text.muted;
    const border = f.colors.border.default;

    const sectionCard: React.CSSProperties = {
        backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
        border: `1px solid ${border}`,
        borderRadius: "1.2rem",
        padding: "1.8rem 2rem",
    };

    const tocItem = (title: string, description: string) => (
        <div
            key={title}
            style={{
                padding: "1.2rem 1.2rem",
                borderRadius: "0.9rem",
                border: `1px dashed ${border}`,
                display: "flex",
                flexDirection: "column",
                gap: "0.3rem",
            }}
        >
            <span style={{ fontSize: "1.35rem", fontWeight: 650, color: f.colors.text.primary }}>{title}</span>
            <span style={{ fontSize: "1.2rem", color: muted, lineHeight: 1.4 }}>{description}</span>
        </div>
    );

    return (
        <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, maxWidth: "110rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <p style={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: muted,
                    marginBottom: "0.4rem",
                }}>
                    Finlumia • Documentação
                </p>
                <h1 style={{ fontSize: "2.6rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.4rem" }}>
                    Guia para compreensão do projeto
                </h1>
                <p style={{ fontSize: "1.4rem", color: muted }}>
                    Conteúdo para apoiar desenvolvimento, manutenção e entendimento da arquitetura do sistema.
                </p>
            </div>

            <div className="grid-responsive" style={{ ["--grid-cols"]: "minmax(0, 1.4fr) minmax(0, 1fr)", alignItems: "start" } as React.CSSProperties}>
                <div style={sectionCard}>
                    <h2 style={{ fontSize: "1.6rem", fontWeight: 650, color: f.colors.text.primary, marginBottom: "1rem" }}>
                        Visão geral
                    </h2>
                    <p style={{ fontSize: "1.3rem", color: muted, lineHeight: 1.6, marginBottom: "1.6rem" }}>
                        O Finlumia foi estruturado com um fluxo de páginas (`app/`) que renderizam componentes reutilizáveis.
                        Para manter consistência UI, componentes seguem a ideia de <b>Atomic Design</b>: átomos, moléculas,
                        organismos e páginas.
                    </p>

                    <div style={{ display: "grid", gap: "1rem" }}>
                        {tocItem("Atomic Design", "Onde ficam os componentes de `atoms`, `organisms` e páginas.")}
                        {tocItem("Rotas e navegação", "Como a `Sidebar` consome `navigation.json` e monta submenus.")}
                        {tocItem("Estilos", "Tokens de tema e como o sistema alterna entre `light` e `dark`.")}
                        {tocItem("Integrações futuras", "Esqueleto para conectar endpoints e persistência.")}
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                    <div style={sectionCard}>
                        <h2 style={{ fontSize: "1.6rem", fontWeight: 650, color: f.colors.text.primary, marginBottom: "1rem" }}>
                            Como navegar
                        </h2>
                        <ul style={{ margin: 0, paddingLeft: "2.2rem", color: muted, fontSize: "1.3rem", lineHeight: 1.7 }}>
                            <li>Use a lateral esquerda para abrir módulos</li>
                            <li>Em <b>Suporte</b>, você verá os submenus de <b>Ticket</b> e <b>Documentação</b></li>
                            <li>As telas usam tokens de tema para manter a identidade visual</li>
                        </ul>
                    </div>

                    <div style={sectionCard}>
                        <h2 style={{ fontSize: "1.6rem", fontWeight: 650, color: f.colors.text.primary, marginBottom: "0.8rem" }}>
                            Próximos passos
                        </h2>
                        <p style={{ fontSize: "1.3rem", color: muted, lineHeight: 1.6 }}>
                            Caso você queira, eu posso:
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginTop: "1rem" }}>
                            {[
                                "Conectar o formulário de Ticket em uma API real",
                                "Converter este guia em páginas menores com conteúdo completo",
                                "Adicionar breadcrumbs para melhorar a orientação do usuário",
                            ].map((s) => (
                                <div
                                    key={s}
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "0.8rem",
                                    }}
                                >
                                    <span style={{ width: "1.2rem", height: "1.2rem", borderRadius: "0.3rem", backgroundColor: f.colors.brand.primary, marginTop: "0.4rem" }} />
                                    <span style={{ fontSize: "1.3rem", color: f.colors.text.secondary, lineHeight: 1.4 }}>{s}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

