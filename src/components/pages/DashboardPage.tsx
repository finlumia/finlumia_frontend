"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { useTheme } from "../../shared/styles/theme.context";
import { useAuth } from "../../contexts/auth.context";
import { transactionsService } from "../../services/movimentation/movement.service";
import { reportsService } from "../../services/document/document.service";
import type { Transaction, KpiSummary } from "../../api/types";

const MONTHS_PT = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];

function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
    if (!iso) return "";
    const [, month, day] = iso.split("-");
    return `${day}/${month}/${iso.slice(0, 4)}`;
}

type StatCardProps = {
    label: string;
    value: string;
    iconColor: string;
    icon: React.ReactNode;
    bgColor: string;
};

function StatCard({ label, value, iconColor, icon, bgColor }: StatCardProps) {
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
            <div style={{ fontSize: "2.4rem", fontWeight: 700, color: f.colors.text.primary }}>{value}</div>
        </div>
    );
}

export function DashboardPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";
    const { user } = useAuth();
    const router = useRouter();

    const [kpi, setKpi] = useState<KpiSummary | null>(null);
    const [recent, setRecent] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const [kpiRes, txRes] = await Promise.all([
                    reportsService.getKPIs({ period: "3m" }),
                    transactionsService.list({ pageSize: 5, sortBy: "date", sortOrder: "desc" }),
                ]);
                if (!cancelled) {
                    setKpi(kpiRes);
                    setRecent(txRes.data);
                }
            } catch {
                /* silently fail — user sees empty state */
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    const now = new Date();
    const greetingPeriod = `${MONTHS_PT[now.getMonth()]} de ${now.getFullYear()}`;
    const firstName = user?.name?.split(" ")[0] ?? "usuário";
    const hour = now.getHours();
    const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

    const primary = f.colors.brand.primary;

    const stats: StatCardProps[] = [
        {
            label: "Saldo líquido",
            value: kpi ? formatCurrency(kpi.saldoLiquido) : "—",
            iconColor: primary,
            bgColor: isDark ? f.colors.feedback.infoBg : "#E0EEF9",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            ),
        },
        {
            label: "Receitas (3 meses)",
            value: kpi ? formatCurrency(kpi.totalReceitas) : "—",
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
            label: "Despesas (3 meses)",
            value: kpi ? formatCurrency(kpi.totalDespesas) : "—",
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
            label: "Patrimônio atual",
            value: kpi ? formatCurrency(kpi.patrimonioAtual) : "—",
            iconColor: f.colors.brand.accent,
            bgColor: isDark ? f.colors.feedback.warningBg : "#FFF3E0",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
                </svg>
            ),
        },
    ];

    return (
        <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, maxWidth: "120rem" }}>
            {/* Header */}
            <div style={{
                marginBottom: "2.8rem", display: "flex", alignItems: "flex-start",
                justifyContent: "space-between", flexWrap: "wrap", gap: "1.2rem",
            }}>
                <div>
                    <h1 style={{ fontSize: "2.4rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.4rem" }}>
                        {greeting}, {firstName} 👋
                    </h1>
                    <p style={{ fontSize: "1.4rem", color: f.colors.text.muted }}>
                        Aqui está o resumo financeiro de {greetingPeriod}.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => router.push("/dashboard/movimentation/transactions?new=1")}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: "0.6rem",
                        height: "4rem", padding: "0 1.8rem", borderRadius: "0.8rem",
                        backgroundColor: primary, color: "#fff", border: "none",
                        fontSize: "1.3rem", fontWeight: 600, cursor: "pointer",
                        fontFamily: f.typography.fontFamily.base, flexShrink: 0,
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Nova movimentação
                </button>
            </div>

            {/* Stats grid */}
            {isLoading ? (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))",
                    gap: "1.6rem",
                    marginBottom: "2.8rem",
                }}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} style={{
                            backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
                            border: `1px solid ${f.colors.border.default}`,
                            borderRadius: "1.2rem",
                            padding: "2rem",
                            height: "10rem",
                            animation: "pulse 1.5s ease-in-out infinite",
                        }} />
                    ))}
                    <style>{`@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }`}</style>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))",
                    gap: "1.6rem",
                    marginBottom: "2.8rem",
                }}>
                    {stats.map((s) => <StatCard key={s.label} {...s} />)}
                </div>
            )}

            {/* Taxa de poupança banner */}
            {!isLoading && kpi && (
                <div style={{
                    padding: "1.4rem 2rem", borderRadius: "1.2rem", marginBottom: "2.8rem",
                    backgroundColor: kpi.taxaPoupanca >= 20
                        ? (isDark ? f.colors.feedback.successBg : "#E6F4ED")
                        : (isDark ? f.colors.feedback.warningBg : "#FFF3E0"),
                    border: `1px solid ${kpi.taxaPoupanca >= 20 ? f.colors.feedback.success : f.colors.feedback.warning}40`,
                    display: "flex", alignItems: "center", gap: "1rem",
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke={kpi.taxaPoupanca >= 20 ? f.colors.feedback.success : f.colors.feedback.warning}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2z" />
                        <path d="M2 9v1a2 2 0 0 0 2 2h1" /><path d="M16 11h.01" />
                    </svg>
                    <span style={{ fontSize: "1.3rem", color: f.colors.text.secondary }}>
                        Taxa de poupança:{" "}
                        <strong style={{ color: kpi.taxaPoupanca >= 20 ? f.colors.feedback.success : f.colors.feedback.warning }}>
                            {kpi.taxaPoupanca.toFixed(1)}%
                        </strong>
                        {" "}— Meta: ≥ 20%
                    </span>
                </div>
            )}

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
                </div>

                <div>
                    {isLoading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", padding: "1.4rem 2rem",
                                borderBottom: i < 4 ? `1px solid ${f.colors.border.default}` : "none",
                                gap: "1.2rem",
                            }}>
                                <div style={{ width: "3.6rem", height: "3.6rem", borderRadius: "50%", backgroundColor: f.colors.bg.surface, animation: "pulse 1.5s ease-in-out infinite" }} />
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                    <div style={{ height: "1.4rem", width: "60%", backgroundColor: f.colors.bg.surface, borderRadius: "0.4rem", animation: "pulse 1.5s ease-in-out infinite" }} />
                                    <div style={{ height: "1.2rem", width: "30%", backgroundColor: f.colors.bg.surface, borderRadius: "0.4rem", animation: "pulse 1.5s ease-in-out infinite" }} />
                                </div>
                            </div>
                        ))
                    ) : recent.length === 0 ? (
                        <div style={{ padding: "3rem 2rem", textAlign: "center", color: f.colors.text.muted, fontSize: "1.4rem" }}>
                            Nenhuma movimentação encontrada.
                        </div>
                    ) : recent.map((tx, idx) => {
                        const isIncome = tx.type === "receita";
                        return (
                            <div key={tx.id} style={{
                                display: "flex", alignItems: "center",
                                padding: "1.4rem 2rem",
                                borderBottom: idx < recent.length - 1 ? `1px solid ${f.colors.border.default}` : "none",
                                gap: "1.2rem",
                            }}>
                                <div style={{
                                    width: "3.6rem", height: "3.6rem", borderRadius: "50%",
                                    backgroundColor: isIncome
                                        ? (isDark ? f.colors.feedback.successBg : "#E6F4ED")
                                        : (isDark ? f.colors.feedback.errorBg : "#FEE2E2"),
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, fontSize: "1.4rem",
                                    color: isIncome ? f.colors.feedback.success : f.colors.feedback.error,
                                }}>
                                    {isIncome ? "↑" : "↓"}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "1.4rem", fontWeight: 600, color: f.colors.text.primary }}>{tx.description}</div>
                                    <div style={{ fontSize: "1.2rem", color: f.colors.text.muted }}>{tx.category}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{
                                        fontSize: "1.4rem", fontWeight: 700,
                                        color: isIncome ? f.colors.feedback.success : f.colors.feedback.error,
                                    }}>
                                        {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                                    </div>
                                    <div style={{ fontSize: "1.1rem", color: f.colors.text.muted }}>{formatDate(tx.date)}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
