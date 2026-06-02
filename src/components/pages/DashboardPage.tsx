"use client";

import React from "react";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { useTheme } from "../../shared/styles/theme.context";

type StatCardProps = {
    label: string;
    value: string;
    delta: string;
    positive: boolean;
    iconColor: string;
    icon: React.ReactNode;
    bgColor: string;
};

function StatCard({ label, value, delta, positive, iconColor, icon, bgColor }: StatCardProps) {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    return (
        <div style={{
            backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
            border: `1px solid ${f.colors.border.default}`,
            borderRadius: "1.2rem",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.2rem",
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "1.3rem", color: f.colors.text.muted, fontWeight: 500 }}>{label}</span>
                <div style={{
                    width: "3.6rem", height: "3.6rem", borderRadius: "0.8rem",
                    backgroundColor: bgColor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: iconColor,
                }}>
                    {icon}
                </div>
            </div>
            <div>
                <div style={{ fontSize: "2.4rem", fontWeight: 700, color: f.colors.text.primary }}>{value}</div>
                <div style={{ fontSize: "1.2rem", color: positive ? f.colors.feedback.success : f.colors.feedback.error, marginTop: "0.2rem", fontWeight: 500 }}>
                    {positive ? "▲" : "▼"} {delta} este mês
                </div>
            </div>
        </div>
    );
}

export function DashboardPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const stats: StatCardProps[] = [
        {
            label: "Saldo total",
            value: "R$ 12.480,00",
            delta: "+R$ 1.240,00",
            positive: true,
            iconColor: f.colors.brand.primary,
            bgColor: isDark ? f.colors.feedback.infoBg : "#E0EEF9",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            ),
        },
        {
            label: "Receitas",
            value: "R$ 8.350,00",
            delta: "+12%",
            positive: true,
            iconColor: f.colors.feedback.success,
            bgColor: isDark ? f.colors.feedback.successBg : "#E6F4ED",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            ),
        },
        {
            label: "Despesas",
            value: "R$ 4.120,00",
            delta: "-8%",
            positive: false,
            iconColor: f.colors.feedback.error,
            bgColor: isDark ? f.colors.feedback.errorBg : "#FEE2E2",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
            ),
        },
        {
            label: "Investimentos",
            value: "R$ 23.900,00",
            delta: "+5.4%",
            positive: true,
            iconColor: f.colors.brand.accent,
            bgColor: isDark ? f.colors.feedback.warningBg : "#FFF3E0",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
                </svg>
            ),
        },
    ];

    const recentTransactions = [
        { id: 1, name: "Mercado", category: "Alimentação", date: "01/06/2026", amount: "-R$ 340,00", type: "expense" },
        { id: 2, name: "Salário", category: "Receita", date: "31/05/2026", amount: "+R$ 7.200,00", type: "income" },
        { id: 3, name: "Conta de luz", category: "Moradia", date: "30/05/2026", amount: "-R$ 180,00", type: "expense" },
        { id: 4, name: "Freelance", category: "Receita extra", date: "28/05/2026", amount: "+R$ 1.150,00", type: "income" },
        { id: 5, name: "Streaming", category: "Lazer", date: "27/05/2026", amount: "-R$ 45,90", type: "expense" },
    ];

    return (
        <div className="page-responsive" style={{
            fontFamily: f.typography.fontFamily.base,
            maxWidth: "120rem",
        }}>
            {/* Header */}
            <div style={{ marginBottom: "2.8rem" }}>
                <h1 style={{ fontSize: "2.4rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.4rem" }}>
                    Bom dia, Thiago 👋
                </h1>
                <p style={{ fontSize: "1.4rem", color: f.colors.text.muted }}>
                    Aqui está o resumo financeiro de junho de 2026.
                </p>
            </div>

            {/* Stats grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))",
                gap: "1.6rem",
                marginBottom: "2.8rem",
            }}>
                {stats.map((s) => <StatCard key={s.label} {...s} />)}
            </div>

            {/* Recent transactions */}
            <div style={{
                backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
                border: `1px solid ${f.colors.border.default}`,
                borderRadius: "1.2rem",
                overflow: "hidden",
            }}>
                <div style={{
                    padding: "1.6rem 2rem",
                    borderBottom: `1px solid ${f.colors.border.default}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}>
                    <h2 style={{ fontSize: "1.6rem", fontWeight: 600, color: f.colors.text.primary }}>
                        Movimentações recentes
                    </h2>
                    <button style={{
                        background: "none", border: "none",
                        color: f.colors.brand.primary, fontSize: "1.3rem",
                        fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                    }}>
                        Ver todas →
                    </button>
                </div>

                <div>
                    {recentTransactions.map((tx, idx) => (
                        <div
                            key={tx.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "1.4rem 2rem",
                                borderBottom: idx < recentTransactions.length - 1 ? `1px solid ${f.colors.border.default}` : "none",
                                gap: "1.2rem",
                            }}
                        >
                            <div style={{
                                width: "3.6rem", height: "3.6rem",
                                borderRadius: "50%",
                                backgroundColor: tx.type === "income"
                                    ? (isDark ? f.colors.feedback.successBg : "#E6F4ED")
                                    : (isDark ? f.colors.feedback.errorBg : "#FEE2E2"),
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                                fontSize: "1.4rem",
                            }}>
                                {tx.type === "income" ? "↑" : "↓"}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "1.4rem", fontWeight: 600, color: f.colors.text.primary }}>{tx.name}</div>
                                <div style={{ fontSize: "1.2rem", color: f.colors.text.muted }}>{tx.category}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{
                                    fontSize: "1.4rem",
                                    fontWeight: 700,
                                    color: tx.type === "income" ? f.colors.feedback.success : f.colors.feedback.error,
                                }}>
                                    {tx.amount}
                                </div>
                                <div style={{ fontSize: "1.1rem", color: f.colors.text.muted }}>{tx.date}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
