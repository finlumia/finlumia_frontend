"use client";

import React, { useCallback, useEffect, useState } from "react";
import { LineAreaChart } from "../atoms/chart/LineAreaChart";
import { DonutChart } from "../atoms/chart/DonutChart";
import { BarChart } from "../atoms/chart/BarChart";
import { HorizontalBar } from "../atoms/chart/HorizontalBar";
import { reportsService } from "../../services/document/document.service";
import type {
    MonthlySummary, KpiSummary, CategoryBreakdown, InstitutionBreakdown, Insight, NetWorthDataPoint,
} from "../../api/types";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { useTheme } from "../../shared/styles/theme.context";
import { PeriodPicker } from "../organisms/PeriodPicker";
import { currentMonthPeriod, type DatePeriod } from "../../shared/finance/period.utils";

// ── helpers ────────────────────────────────────────────────────────────────

type Period = "3m" | "6m" | "12m" | "ytd" | "custom";
type CategoryType = "despesa" | "receita";

function fmt(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ── sub-components ─────────────────────────────────────────────────────────

type Foundation = ReturnType<typeof getFoundationByTheme>;

function KpiCard({
    label, value, delta, deltaPositive, sub, accent, f, isDark,
}: {
    label: string; value: string; delta?: string; deltaPositive?: boolean;
    sub?: string; accent: string; f: Foundation; isDark: boolean;
}) {
    return (
        <div style={{
            backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
            border: `1px solid ${f.colors.border.default}`,
            borderRadius: "1.2rem",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
        }}>
            <span style={{ fontSize: "1.2rem", fontWeight: 600, color: f.colors.text.muted, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {label}
            </span>
            <span style={{ fontSize: "2.6rem", fontWeight: 800, color: accent, lineHeight: 1.1 }}>
                {value}
            </span>
            {delta && (
                <span style={{ fontSize: "1.2rem", fontWeight: 600, color: deltaPositive ? f.colors.feedback.success : f.colors.feedback.error }}>
                    {deltaPositive ? "▲" : "▼"} {delta}
                </span>
            )}
            {sub && <span style={{ fontSize: "1.1rem", color: f.colors.text.muted }}>{sub}</span>}
        </div>
    );
}

function ChartCard({
    title, subtitle, children, f, isDark, action,
}: {
    title: string; subtitle?: string; children: React.ReactNode;
    f: Foundation; isDark: boolean; action?: React.ReactNode;
}) {
    return (
        <div style={{
            backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
            border: `1px solid ${f.colors.border.default}`,
            borderRadius: "1.2rem",
            overflow: "hidden",
        }}>
            <div style={{
                display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                padding: "1.6rem 2rem", borderBottom: `1px solid ${f.colors.border.default}`,
            }}>
                <div>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: f.colors.text.primary }}>{title}</h3>
                    {subtitle && <p style={{ fontSize: "1.2rem", color: f.colors.text.muted, marginTop: "0.2rem" }}>{subtitle}</p>}
                </div>
                {action}
            </div>
            <div style={{ padding: "1.6rem 2rem" }}>
                {children}
            </div>
        </div>
    );
}

function SkeletonCard({ f, isDark }: { f: Foundation; isDark: boolean }) {
    return (
        <div style={{
            backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
            border: `1px solid ${f.colors.border.default}`,
            borderRadius: "1.2rem",
            padding: "2rem",
            height: "12rem",
            animation: "pulse 1.5s ease-in-out infinite",
        }}>
            <style>{`@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }`}</style>
        </div>
    );
}

const INSIGHT_ICONS: Record<string, React.ReactNode> = {
    "trending-up": (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 7-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" />
        </svg>
    ),
    "trending-down": (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 17-8.5-8.5-5 5L2 7" /><path d="M16 17h6v-6" />
        </svg>
    ),
    "alert": (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4M12 17h.01" />
        </svg>
    ),
    "piggy": (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2z" />
            <path d="M2 9v1a2 2 0 0 0 2 2h1" /><path d="M16 11h.01" />
        </svg>
    ),
    "chart": (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
        </svg>
    ),
};

const INSIGHT_STYLE: Record<Insight["type"], { color: string; bgDark: string; bgLight: string }> = {
    positive: { color: "#56D364", bgDark: "#0F2A1A", bgLight: "#E6F4ED" },
    negative: { color: "#FF7B54", bgDark: "#2A1010", bgLight: "#FEE2E2" },
    alert:    { color: "#F0E442", bgDark: "#2A2200", bgLight: "#FFF9C4" },
    neutral:  { color: "#6BB5FF", bgDark: "#0A1E35", bgLight: "#E0EEF9" },
};

const PERIOD_OPTIONS: { id: Period; label: string }[] = [
    { id: "3m",     label: "3 meses" },
    { id: "6m",     label: "6 meses" },
    { id: "12m",    label: "12 meses" },
    { id: "ytd",    label: "Este ano" },
    { id: "custom", label: "Personalizado" },
];

// Cada aba responde a UMA pergunta do usuário final, em vez de jogar todos os
// gráficos juntos na mesma tela — o que dificultava a leitura (feedback de
// usabilidade). "geral" fica sempre visível como ponto de partida.
type ReportView = "geral" | "categorias" | "comparativo" | "patrimonio" | "bancos" | "insights";

const REPORT_VIEWS: { id: ReportView; label: string; question: string }[] = [
    { id: "geral",       label: "Visão geral",        question: "Como estão minhas finanças no período?" },
    { id: "comparativo", label: "Receita x Despesa",  question: "Estou gastando mais do que ganho?" },
    { id: "categorias",  label: "Categorias",         question: "Em que estou gastando mais?" },
    { id: "patrimonio",  label: "Patrimônio",         question: "Meu patrimônio está crescendo?" },
    { id: "bancos",      label: "Bancos",             question: "Onde estão minhas movimentações?" },
    { id: "insights",    label: "Insights",           question: "O que a Finlumia percebeu nos meus dados?" },
];

// ── main page ───────────────────────────────────────────────────────────────

export function ReportsPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";
    const [period, setPeriod] = useState<Period>("6m");
    const [customPeriod, setCustomPeriod] = useState<DatePeriod>(currentMonthPeriod());
    const [categoryType, setCategoryType] = useState<CategoryType>("despesa");
    const [view, setView] = useState<ReportView>("geral");
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [kpi, setKpi] = useState<KpiSummary | null>(null);
    const [cashFlow, setCashFlow] = useState<MonthlySummary[]>([]);
    const [netWorth, setNetWorth] = useState<NetWorthDataPoint[]>([]);
    const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
    const [categoriesTotal, setCategoriesTotal] = useState(0);
    const [institutions, setInstitutions] = useState<InstitutionBreakdown[]>([]);
    const [insights, setInsights] = useState<Insight[]>([]);

    // Filtro personalizado: só dispara a busca quando as duas datas estão
    // preenchidas e a inicial não é depois da final (evita chamadas inválidas
    // a cada tecla digitada no seletor de data).
    const customRangeReady = period !== "custom"
        || (!!customPeriod.start && !!customPeriod.end && customPeriod.start <= customPeriod.end);

    const load = useCallback(async (p: Period, categoryFilterType: CategoryType, start: string, end: string) => {
        setIsLoading(true);
        setLoadError("");
        try {
            const q = p === "custom"
                ? { period: p, periodStart: start, periodEnd: end }
                : { period: p };
            const [kpiRes, cfRes, nwRes, catRes, instRes, insRes] = await Promise.all([
                reportsService.getKPIs(q),
                reportsService.getCashFlow(q),
                reportsService.getNetWorth(q),
                reportsService.getByCategory({ ...q, type: categoryFilterType }),
                reportsService.getByInstitution(q),
                reportsService.getInsights(q),
            ]);
            setKpi(kpiRes);
            setCashFlow(cfRes.data);
            setNetWorth(nwRes.data);
            setCategories(catRes.data);
            setCategoriesTotal(catRes.total);
            setInstitutions(instRes.data);
            setInsights(insRes.data);
        } catch (err: unknown) {
            setLoadError((err as { message?: string })?.message ?? "Não foi possível carregar os relatórios.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!customRangeReady) return;
        load(period, categoryType, customPeriod.start, customPeriod.end);
    }, [period, categoryType, customPeriod, customRangeReady, load]);

    const xLabels = cashFlow.map((d) => d.month);

    const cashFlowSeries = [
        { label: "Receitas",  values: cashFlow.map((d) => d.receitas),  color: f.colors.feedback.success, showArea: true },
        { label: "Despesas",  values: cashFlow.map((d) => d.despesas),  color: f.colors.feedback.error,   showArea: true },
        { label: "Saldo",     values: cashFlow.map((d) => d.saldo),     color: f.colors.brand.primary,    showArea: false },
    ];

    const patrimonioSeries = [
        { label: "Patrimônio líquido", values: netWorth.map((d) => d.patrimonio), color: f.colors.brand.primary, showArea: true },
    ];

    const barGroups = cashFlow.map((d) => ({ label: d.month, values: [d.receitas, d.despesas] }));
    const barSeries = [
        { label: "Receitas", color: f.colors.feedback.success },
        { label: "Despesas", color: f.colors.feedback.error },
    ];

    const donutSlices = categories.map((c) => ({
        id: c.categoryId, label: c.label, value: c.total, percent: c.percent, color: c.color,
    }));

    const hbarItems = institutions.map((inst) => ({
        id: inst.id, label: inst.label, value: inst.total, percent: inst.percent, color: inst.color, sublabel: inst.abbr,
    }));

    const catTotal = categoriesTotal;

    const border = f.colors.border.default;
    const muted  = f.colors.text.muted;

    return (
        <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, maxWidth: "140rem" }}>

            {/* ── Page header ─────────────────────────────────────── */}
            <div style={{ marginBottom: "2.4rem" }}>
                <p style={{ fontSize: "1.2rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: muted, marginBottom: "0.4rem" }}>
                    Análise financeira
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.2rem" }}>
                    <h1 style={{ fontSize: "2.8rem", fontWeight: 700, color: f.colors.text.primary }}>
                        Relatórios
                    </h1>
                    {/* Period selector */}
                    <div style={{ display: "flex", gap: "0.4rem", backgroundColor: isDark ? f.colors.bg.elevated : f.colors.bg.elevated, borderRadius: "0.8rem", padding: "0.3rem" }}>
                        {PERIOD_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setPeriod(opt.id)}
                                style={{
                                    padding: "0.5rem 1.2rem", borderRadius: "0.6rem", border: "none",
                                    fontSize: "1.3rem", fontWeight: period === opt.id ? 600 : 400,
                                    cursor: "pointer", fontFamily: "inherit",
                                    backgroundColor: period === opt.id ? (isDark ? f.colors.bg.surface : "#fff") : "transparent",
                                    color: period === opt.id ? f.colors.text.primary : muted,
                                    boxShadow: period === opt.id ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filtro personalizado: aparece só quando "Personalizado" está selecionado.
                    Mesmo PeriodPicker usado no Orçamento — calendário responsivo em vez de
                    dois <input type="date"> soltos, que ficavam ruins de usar no celular. */}
                {period === "custom" && (
                    <div style={{
                        marginTop: "1.2rem", padding: "1.6rem", borderRadius: "1rem",
                        border: `1px solid ${border}`, backgroundColor: isDark ? f.colors.bg.elevated : "#fff",
                    }}>
                        <PeriodPicker
                            value={customPeriod}
                            onChange={setCustomPeriod}
                            theme={theme}
                            error={!customRangeReady ? "Escolha as duas datas (inicial antes da final) para carregar o período personalizado." : undefined}
                        />
                    </div>
                )}
            </div>

            {loadError && (
                <div style={{
                    marginBottom: "1.6rem", padding: "1rem 1.4rem", borderRadius: "0.8rem",
                    backgroundColor: isDark ? f.colors.feedback.errorBg : "#FEF2F2",
                    border: `1px solid ${f.colors.feedback.error}`,
                    color: f.colors.feedback.error, fontSize: "1.3rem",
                }}>
                    {loadError}
                </div>
            )}

            {/* ── KPI cards ───────────────────────────────────────── */}
            {isLoading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "1.4rem", marginBottom: "2.4rem" }}>
                    {[...Array(5)].map((_, i) => <SkeletonCard key={i} f={f} isDark={isDark} />)}
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "1.4rem", marginBottom: "2.4rem" }}>
                    <KpiCard
                        label="Total de receitas" value={fmt(kpi?.totalReceitas ?? 0)}
                        sub={`${cashFlow.length} meses`}
                        accent={f.colors.feedback.success} f={f} isDark={isDark}
                    />
                    <KpiCard
                        label="Total de despesas" value={fmt(kpi?.totalDespesas ?? 0)}
                        sub="no período"
                        accent={f.colors.feedback.error} f={f} isDark={isDark}
                    />
                    <KpiCard
                        label="Saldo líquido" value={fmt(kpi?.saldoLiquido ?? 0)}
                        delta="Receitas – Despesas"
                        accent={(kpi?.saldoLiquido ?? 0) >= 0 ? f.colors.brand.primary : f.colors.feedback.error}
                        f={f} isDark={isDark}
                    />
                    <KpiCard
                        label="Taxa de poupança" value={`${(kpi?.taxaPoupanca ?? 0).toFixed(1)}%`}
                        delta="Meta: ≥ 20%" deltaPositive={(kpi?.taxaPoupanca ?? 0) >= 20}
                        sub="do total recebido"
                        accent={(kpi?.taxaPoupanca ?? 0) >= 20 ? f.colors.feedback.success : f.colors.feedback.warning}
                        f={f} isDark={isDark}
                    />
                    <KpiCard
                        label="Patrimônio atual" value={fmt(kpi?.patrimonioAtual ?? 0)}
                        delta={`${kpi?.crescimentoPatrimonio !== undefined ? (kpi.crescimentoPatrimonio >= 0 ? "+" : "") + kpi.crescimentoPatrimonio.toFixed(1) + "%" : ""}`}
                        deltaPositive={(kpi?.crescimentoPatrimonio ?? 0) >= 0}
                        sub="no período selecionado"
                        accent={f.colors.brand.primary} f={f} isDark={isDark}
                    />
                </div>
            )}

            {/* ── Seletor de relatório: cada aba responde a uma pergunta ── */}
            <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.8rem" }}>
                    {REPORT_VIEWS.map((v) => {
                        const active = view === v.id;
                        return (
                            <button
                                key={v.id}
                                type="button"
                                onClick={() => setView(v.id)}
                                style={{
                                    padding: "0.8rem 1.6rem", borderRadius: "0.8rem",
                                    border: `1.5px solid ${active ? f.colors.brand.primary : border}`,
                                    backgroundColor: active ? `${f.colors.brand.primary}18` : "transparent",
                                    color: active ? f.colors.brand.primary : f.colors.text.secondary,
                                    fontSize: "1.3rem", fontWeight: active ? 700 : 500,
                                    cursor: "pointer", fontFamily: "inherit",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                {v.label}
                            </button>
                        );
                    })}
                </div>
                <p style={{ fontSize: "1.3rem", color: muted, fontStyle: "italic" }}>
                    {REPORT_VIEWS.find((v) => v.id === view)?.question}
                </p>
            </div>

            {/* ══ Visão geral: fluxo de caixa + saldo mensal ══════════ */}
            {view === "geral" && (
            <>
                <div style={{ marginBottom: "2rem" }}>
                    <ChartCard
                        title="Fluxo de Caixa"
                        subtitle="Receitas, despesas e saldo ao longo do período"
                        f={f} isDark={isDark}
                        action={
                            <div style={{ display: "flex", gap: "1.4rem" }}>
                                {cashFlowSeries.map((s) => (
                                    <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <div style={{ width: "2rem", height: "3px", backgroundColor: s.color, borderRadius: "2px" }} />
                                        <span style={{ fontSize: "1.1rem", color: muted }}>{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        }
                    >
                        {cashFlow.length > 0
                            ? <LineAreaChart series={cashFlowSeries} labels={xLabels} theme={theme} />
                            : <div style={{ height: "20rem", display: "flex", alignItems: "center", justifyContent: "center", color: muted, fontSize: "1.3rem" }}>Sem dados para o período selecionado</div>
                        }
                    </ChartCard>
                </div>

                {cashFlow.length > 0 && (
                    <ChartCard
                        title="Resumo de Saldo por Mês"
                        subtitle="Quanto sobrou após todas as despesas — por mês"
                        f={f} isDark={isDark}
                    >
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))", gap: "1rem" }}>
                            {cashFlow.map((d) => {
                                const isPositive = d.saldo >= 0;
                                const maxAbs = Math.max(...cashFlow.map((x) => Math.abs(x.saldo)), 1);
                                const barHeight = (Math.abs(d.saldo) / maxAbs) * 100;

                                return (
                                    <div key={`${d.month}-${d.year}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
                                        <div style={{ height: "6rem", display: "flex", alignItems: "flex-end" }}>
                                            <div style={{
                                                width: "2.8rem",
                                                height: `${Math.min(barHeight, 100)}%`,
                                                minHeight: "0.4rem",
                                                borderRadius: "0.4rem",
                                                backgroundColor: isPositive ? f.colors.feedback.success : f.colors.feedback.error,
                                                opacity: 0.85,
                                            }} />
                                        </div>
                                        <span style={{ fontSize: "1.3rem", fontWeight: 700, color: isPositive ? f.colors.feedback.success : f.colors.feedback.error }}>
                                            {fmt(d.saldo)}
                                        </span>
                                        <span style={{ fontSize: "1.1rem", color: muted }}>{d.month}/{String(d.year).slice(2)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </ChartCard>
                )}
            </>
            )}

            {/* ══ Receita x Despesa: comparativo mensal ═══════════════ */}
            {view === "comparativo" && (
                <ChartCard
                    title="Receitas vs Despesas"
                    subtitle="Comparativo mensal do período"
                    f={f} isDark={isDark}
                    action={
                        <div style={{ display: "flex", gap: "1.2rem" }}>
                            {barSeries.map((s) => (
                                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <div style={{ width: "1rem", height: "1rem", borderRadius: "0.2rem", backgroundColor: s.color }} />
                                    <span style={{ fontSize: "1.1rem", color: muted }}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    }
                >
                    {barGroups.length > 0
                        ? <BarChart groups={barGroups} series={barSeries} theme={theme} />
                        : <div style={{ height: "20rem", display: "flex", alignItems: "center", justifyContent: "center", color: muted, fontSize: "1.3rem" }}>Sem dados</div>
                    }
                </ChartCard>
            )}

            {/* ══ Categorias: donut + ranking detalhado ═══════════════ */}
            {view === "categorias" && (
            <>
                {/* Filtro: ver categorias de despesa ou de receita */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.2rem" }}>
                    {(["despesa", "receita"] as CategoryType[]).map((t) => {
                        const active = categoryType === t;
                        return (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setCategoryType(t)}
                                style={{
                                    padding: "0.6rem 1.4rem", borderRadius: "999px",
                                    border: `1.5px solid ${active ? f.colors.brand.primary : border}`,
                                    backgroundColor: active ? `${f.colors.brand.primary}18` : "transparent",
                                    color: active ? f.colors.brand.primary : muted,
                                    fontSize: "1.2rem", fontWeight: active ? 700 : 500,
                                    cursor: "pointer", fontFamily: "inherit",
                                }}
                            >
                                {t === "despesa" ? "Despesas" : "Receitas"}
                            </button>
                        );
                    })}
                </div>
            <div className="grid-responsive" style={{ ["--grid-cols"]: "1fr 1.4fr", marginBottom: "2rem" } as React.CSSProperties}>
                <ChartCard
                    title={categoryType === "despesa" ? "Despesas por Categoria" : "Receitas por Categoria"}
                    subtitle={catTotal > 0 ? `Total: ${fmt(catTotal)}` : undefined}
                    f={f} isDark={isDark}
                >
                    {donutSlices.length > 0
                        ? <DonutChart
                            slices={donutSlices}
                            centerLabel={categoryType === "despesa" ? "Total gasto" : "Total recebido"}
                            centerValue={`R$${(catTotal / 1000).toFixed(1)}k`}
                            theme={theme}
                          />
                        : <div style={{ height: "20rem", display: "flex", alignItems: "center", justifyContent: "center", color: muted, fontSize: "1.3rem" }}>Sem dados</div>
                    }
                </ChartCard>

                <ChartCard
                    title="Ranking de Categorias"
                    subtitle="Evolução vs período anterior"
                    f={f} isDark={isDark}
                >
                    {categories.length === 0 ? (
                        <div style={{ padding: "3rem 0", textAlign: "center", color: muted, fontSize: "1.3rem" }}>Sem dados de categorias</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                            <div style={{
                                display: "grid", gridTemplateColumns: "1fr auto auto auto",
                                gap: "0.8rem", padding: "0.4rem 0 0.8rem",
                                borderBottom: `1px solid ${border}`, marginBottom: "0.4rem",
                            }}>
                                {["Categoria", "Total", "Share", "Tendência"].map((h) => (
                                    <span key={h} style={{ fontSize: "1.1rem", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
                                ))}
                            </div>
                            {categories.map((cat, idx) => (
                                <div key={cat.categoryId} style={{
                                    display: "grid", gridTemplateColumns: "1fr auto auto auto",
                                    gap: "0.8rem", padding: "0.9rem 0",
                                    borderBottom: idx < categories.length - 1 ? `1px solid ${border}` : "none",
                                    alignItems: "center",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                                        <div style={{ width: "0.7rem", height: "0.7rem", borderRadius: "50%", backgroundColor: cat.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: "1.3rem", color: f.colors.text.secondary }}>{cat.label}</span>
                                    </div>
                                    <span style={{ fontSize: "1.3rem", fontWeight: 600, color: f.colors.text.primary }}>{fmt(cat.total)}</span>
                                    <span style={{ fontSize: "1.2rem", color: muted }}>{cat.percent.toFixed(1)}%</span>
                                    <span style={{
                                        fontSize: "1.2rem", fontWeight: 600,
                                        // Para despesas, subir é ruim (vermelho); para receitas, subir é bom (verde).
                                        color: cat.trend === 0 ? muted
                                            : (cat.trend > 0) === (categoryType === "receita")
                                                ? f.colors.feedback.success
                                                : f.colors.feedback.error,
                                    }}>
                                        {cat.trend === 0 ? "—" : `${cat.trend > 0 ? "▲" : "▼"} ${Math.abs(cat.trend).toFixed(1)}%`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </ChartCard>
            </div>
            </>
            )}

            {/* ══ Patrimônio: evolução acumulada ═══════════════════════ */}
            {view === "patrimonio" && (
                <ChartCard
                    title="Evolução do Patrimônio"
                    subtitle="Saldo acumulado ao longo do período"
                    f={f} isDark={isDark}
                >
                    {netWorth.length > 0
                        ? <LineAreaChart series={patrimonioSeries} labels={netWorth.map((d) => d.month)} theme={theme} />
                        : <div style={{ height: "20rem", display: "flex", alignItems: "center", justifyContent: "center", color: muted, fontSize: "1.3rem" }}>Sem dados</div>
                    }
                </ChartCard>
            )}

            {/* ══ Bancos: distribuição por instituição ═════════════════ */}
            {view === "bancos" && (
                <ChartCard
                    title="Por Instituição Financeira"
                    subtitle="Distribuição de gastos por banco"
                    f={f} isDark={isDark}
                >
                    {hbarItems.length > 0
                        ? <HorizontalBar items={hbarItems} theme={theme} />
                        : <div style={{ height: "20rem", display: "flex", alignItems: "center", justifyContent: "center", color: muted, fontSize: "1.3rem" }}>Sem dados</div>
                    }
                </ChartCard>
            )}

            {/* ══ Insights automáticos ══════════════════════════════════ */}
            {view === "insights" && (
                <ChartCard
                    title="Insights Automáticos"
                    subtitle="Análises geradas a partir dos seus dados"
                    f={f} isDark={isDark}
                >
                    {insights.length === 0 ? (
                        <div style={{ padding: "3rem 0", textAlign: "center", color: muted, fontSize: "1.3rem" }}>Nenhum insight disponível</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {insights.map((ins) => {
                                const style = INSIGHT_STYLE[ins.type];
                                return (
                                    <div key={ins.id} style={{
                                        display: "flex", gap: "1rem", padding: "1.2rem",
                                        borderRadius: "0.8rem",
                                        backgroundColor: isDark ? style.bgDark : style.bgLight,
                                        border: `1px solid ${style.color}30`,
                                    }}>
                                        <div style={{
                                            width: "3.2rem", height: "3.2rem", borderRadius: "0.6rem",
                                            backgroundColor: `${style.color}20`, color: style.color,
                                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                        }}>
                                            {INSIGHT_ICONS[ins.icon]}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: "1.3rem", fontWeight: 600, color: f.colors.text.primary, marginBottom: "0.2rem" }}>{ins.title}</p>
                                            <p style={{ fontSize: "1.2rem", color: muted, lineHeight: 1.5 }}>{ins.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ChartCard>
            )}
        </div>
    );
}
