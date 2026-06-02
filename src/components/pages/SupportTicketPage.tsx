"use client";

import React from "react";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { useTheme } from "../../shared/styles/theme.context";
import { Input } from "../atoms/input";
import { Button } from "../atoms/button";

export function SupportTicketPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);

    const isDark = theme === "dark";
    const border = f.colors.border.default;
    const muted = f.colors.text.muted;

    const cardStyle: React.CSSProperties = {
        backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
        borderRadius: "1.2rem",
        border: `1px solid ${border}`,
        padding: "1.8rem 2rem",
    };

    return (
        <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, maxWidth: "96rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <p style={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: muted,
                    marginBottom: "0.4rem",
                }}>
                    Ajuda &amp; suporte
                </p>
                <h1 style={{ fontSize: "2.6rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.4rem" }}>
                    Tickets de suporte
                </h1>
                <p style={{ fontSize: "1.4rem", color: muted }}>
                    Acompanhe dúvidas, incidentes e melhorias relacionadas ao uso do Finlumia.
                </p>
            </div>

            <div className="grid-responsive" style={{ ["--grid-cols"]: "minmax(0, 2fr) minmax(0, 1.4fr)", alignItems: "flex-start" } as React.CSSProperties}>
                {/* Formulário conceitual */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: "1.6rem", fontWeight: 600, color: f.colors.text.primary, marginBottom: "1.2rem" }}>
                        Abrir novo ticket
                    </h2>
                    <p style={{ fontSize: "1.3rem", color: muted, marginBottom: "1.4rem" }}>
                        Formulário conceitual para abrir um novo ticket de suporte.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "1.2rem", fontWeight: 600, color: f.colors.text.secondary, marginBottom: "0.4rem" }}>
                                Título do ticket
                            </label>
                            <Input
                                id="ticket-title"
                                name="ticketTitle"
                                placeholder="Ex.: Erro ao importar extrato de movimentações"
                                disabled
                                theme={theme}
                            />
                            <p style={{ fontSize: "1.1rem", color: muted, marginTop: "0.3rem" }}>
                                No backend, você irá persistir este campo como o assunto ou resumo do chamado.
                            </p>
                        </div>

                        <div className="grid-pair" style={{ ["--grid-cols"]: "1.4fr 1fr" } as React.CSSProperties}>
                            <div>
                                <label style={{ display: "block", fontSize: "1.2rem", fontWeight: 600, color: f.colors.text.secondary, marginBottom: "0.4rem" }}>
                                    Categoria
                                </label>
                                <select
                                    disabled
                                    style={{
                                        width: "100%",
                                        height: "3.8rem",
                                        borderRadius: "0.8rem",
                                        border: `1px dashed ${border}`,
                                        padding: "0 1.2rem",
                                        backgroundColor: isDark ? f.colors.bg.surface : f.colors.bg.app,
                                        color: f.colors.text.primary,
                                        fontSize: "1.3rem",
                                        fontFamily: "inherit",
                                        opacity: 0.7,
                                        cursor: "not-allowed",
                                    }}
                                >
                                    <option>Selecione (conceitual)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "1.2rem", fontWeight: 600, color: f.colors.text.secondary, marginBottom: "0.4rem" }}>
                                    Prioridade
                                </label>
                                <select
                                    disabled
                                    style={{
                                        width: "100%",
                                        height: "3.8rem",
                                        borderRadius: "0.8rem",
                                        border: `1px dashed ${border}`,
                                        padding: "0 1.2rem",
                                        backgroundColor: isDark ? f.colors.bg.surface : f.colors.bg.app,
                                        color: f.colors.text.primary,
                                        fontSize: "1.3rem",
                                        fontFamily: "inherit",
                                        opacity: 0.7,
                                        cursor: "not-allowed",
                                    }}
                                >
                                    <option>Baixa / Média / Alta</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "1.2rem", fontWeight: 600, color: f.colors.text.secondary, marginBottom: "0.4rem" }}>
                                Descrição detalhada
                            </label>
                            <textarea
                                rows={5}
                                disabled
                                placeholder="Explique o que aconteceu, quais passos reproduzem o problema e o que você esperava que acontecesse."
                                style={{
                                    width: "100%",
                                    borderRadius: "0.8rem",
                                    border: `1px dashed ${border}`,
                                    padding: "0.9rem 1.2rem",
                                    backgroundColor: isDark ? f.colors.bg.surface : f.colors.bg.app,
                                    color: f.colors.text.primary,
                                    fontSize: "1.3rem",
                                    fontFamily: "inherit",
                                    resize: "vertical",
                                    opacity: 0.7,
                                    cursor: "not-allowed",
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                label="Enviar (exemplo)"
                                type="button"
                                theme={theme}
                                variant="primary"
                                size="md"
                                disabled
                                onClick={() => {}}
                                styleConfig={{
                                    backgroudColor: f.colors.brand.primary,
                                    textColor: "#fff",
                                    border: "none",
                                    borderRadius: "0.9rem",
                                    padding: "0 1.8rem",
                                    height: "3.6rem",
                                    fontWeight: "600",
                                    fontFamily: "inherit",
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Lista de exemplo */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: "1.6rem", fontWeight: 600, color: f.colors.text.primary, marginBottom: "1.2rem" }}>
                        Fluxo sugerido de tickets
                    </h2>
                    <p style={{ fontSize: "1.3rem", color: muted, marginBottom: "1.4rem" }}>
                        Os itens abaixo são apenas exemplos para guiar o desenho do fluxo de suporte.
                        Quando integrar com sua API, você pode substituir por uma tabela real vinda do backend.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                        {[
                            { id: "#1023", title: "Erro 500 ao salvar movimentação", status: "Em análise", type: "bug" },
                            { id: "#1018", title: "Dúvida sobre relatórios mensais", status: "Respondido", type: "duvida" },
                            { id: "#1012", title: "Sugestão: exportar CSV de tickets", status: "Backlog", type: "ideia" },
                        ].map((t) => (
                            <div
                                key={t.id}
                                style={{
                                    borderRadius: "0.8rem",
                                    border: `1px dashed ${border}`,
                                    padding: "0.8rem 1rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "1rem",
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: "1.25rem", fontWeight: 600, color: f.colors.text.primary }}>
                                        {t.id} · {t.title}
                                    </div>
                                    <div style={{ fontSize: "1.1rem", color: muted }}>
                                        Tipo: {t.type === "bug" ? "Bug" : t.type === "duvida" ? "Dúvida" : "Ideia"}
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 600,
                                    padding: "0.3rem 0.9rem",
                                    borderRadius: "999px",
                                    border: `1px solid ${f.colors.brand.primary}40`,
                                    color: f.colors.brand.primary,
                                    backgroundColor: isDark ? f.colors.bg.surface : f.colors.bg.app,
                                    whiteSpace: "nowrap",
                                }}>
                                    {t.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

