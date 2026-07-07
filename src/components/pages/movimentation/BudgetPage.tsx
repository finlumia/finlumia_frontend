"use client";

import React, { useMemo, useState } from "react";
import { parseMoney } from "../../../lib/money";
import { Modal } from "../../organisms/Modal";
import { Input } from "../../atoms/input";
import { Button } from "../../atoms/button";
import { PeriodPicker } from "../../organisms/PeriodPicker";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { useTheme } from "../../../shared/styles/theme.context";
import {
    useFinance, currentMonthPeriod,
    type BudgetScope, type BudgetStatus, type DatePeriod,
} from "../../../shared/finance/finance.context";
import { formatPeriodShort, isValidISO } from "../../../shared/finance/period.utils";

function fmt(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const SCOPE_OPTIONS: { id: BudgetScope; label: string }[] = [
    { id: "global", label: "Geral (todas as despesas)" },
    { id: "category", label: "Por setor / categoria" },
    { id: "method", label: "Por forma de pagamento" },
    { id: "bank", label: "Por banco" },
];

type FormState = {
    name: string;
    scope: BudgetScope;
    refId: string;
    amount: string;
    period: DatePeriod;
};

const emptyForm = (): FormState => ({
    name: "",
    scope: "category",
    refId: "",
    amount: "",
    period: currentMonthPeriod(),
});

function validatePeriod(period: DatePeriod): string | undefined {
    if (!period.start || !period.end) return "Selecione o período completo (de/até).";
    if (!isValidISO(period.start) || !isValidISO(period.end)) return "Datas inválidas.";
    if (period.start > period.end) return "A data inicial não pode ser posterior à final.";
    return undefined;
}

export function BudgetPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const { categories, paymentMethods, banks, addBudget, removeBudget, budgetStatusFor } = useFinance();

    const [filterPeriod, setFilterPeriod] = useState<DatePeriod>(currentMonthPeriod());
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<FormState>(emptyForm());
    const [errors, setErrors] = useState<Partial<Record<keyof FormState | "period", string>>>({});

    const statuses = useMemo(() => budgetStatusFor(filterPeriod), [budgetStatusFor, filterPeriod]);
    const exceeded = statuses.filter((s) => s.exceeded);

    const totals = useMemo(() => {
        const budgeted = statuses.reduce((s, b) => s + b.amount, 0);
        const spent = statuses.reduce((s, b) => s + b.spent, 0);
        return { budgeted, spent, remaining: budgeted - spent };
    }, [statuses]);

    const primary = f.colors.brand.primary;
    const border = f.colors.border.default;
    const muted = f.colors.text.muted;
    const surface = isDark ? f.colors.bg.elevated : "#FFFFFF";

    const refOptions = useMemo(() => {
        if (form.scope === "category") return categories.map((c) => ({ value: c.id, label: c.label }));
        if (form.scope === "method") return paymentMethods.map((m) => ({ value: m.id, label: m.label }));
        if (form.scope === "bank") return banks.map((b) => ({ value: b.id, label: b.label }));
        return [];
    }, [form.scope, categories, paymentMethods, banks]);

    const openNew = () => {
        setForm(emptyForm());
        setErrors({});
        setShowModal(true);
    };

    const handleSave = () => {
        const e: typeof errors = {};
        if (!form.name.trim()) e.name = "Informe um nome.";
        const amount = parseMoney(form.amount);
        if (!form.amount || isNaN(amount) || amount <= 0) e.amount = "Informe um valor válido.";
        if (form.scope !== "global" && !form.refId) e.refId = "Selecione uma opção.";
        const periodErr = validatePeriod(form.period);
        if (periodErr) e.period = periodErr;
        setErrors(e);
        if (Object.keys(e).length > 0) return;

        addBudget({
            name: form.name.trim(),
            scope: form.scope,
            refId: form.scope === "global" ? null : form.refId,
            amount,
            periodStart: form.period.start,
            periodEnd: form.period.end,
        });
        setShowModal(false);
    };

    const card: React.CSSProperties = {
        backgroundColor: surface,
        border: `1px solid ${border}`,
        borderRadius: "1.2rem",
        padding: "2rem",
    };

    const labelStyle: React.CSSProperties = {
        display: "block", fontSize: "1.3rem", fontWeight: 500,
        color: f.colors.text.secondary, marginBottom: "0.6rem",
    };

    const selectStyle: React.CSSProperties = {
        width: "100%", height: "4rem", padding: "0 1.2rem", borderRadius: "0.8rem",
        border: `1px solid ${border}`, backgroundColor: isDark ? f.colors.bg.surface : "#fff",
        color: f.colors.text.primary, fontSize: "1.3rem", fontFamily: "inherit", outline: "none",
    };

    return (
        <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, maxWidth: "120rem" }}>
            {/* Header */}
            <div style={{ marginBottom: "0.4rem" }}>
                <p style={{ fontSize: "1.2rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: muted, marginBottom: "0.4rem" }}>
                    Movimentações
                </p>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1.2rem" }}>
                    <div>
                        <h1 style={{ fontSize: "2.8rem", fontWeight: 700, color: f.colors.text.primary }}>Orçamento por período</h1>
                        <p style={{ fontSize: "1.3rem", color: muted, marginTop: "0.4rem" }}>
                            Exibindo orçamentos ativos em <strong style={{ color: f.colors.text.secondary }}>{formatPeriodShort(filterPeriod)}</strong>
                        </p>
                    </div>
                    <Button
                        label="+ Novo orçamento"
                        type="button"
                        theme={theme}
                        variant="primary"
                        size="md"
                        onClick={openNew}
                        styleConfig={{ backgroudColor: primary, textColor: "#fff", border: "none", borderRadius: "0.8rem", padding: "0 1.6rem", fontWeight: "600" }}
                    />
                </div>
            </div>

            {/* Filter period */}
            <div style={{ ...card, marginTop: "1.6rem", marginBottom: "0.4rem", padding: "1.6rem" }}>
                <label style={{ ...labelStyle, marginBottom: "1rem" }}>Filtrar por período</label>
                <PeriodPicker
                    value={filterPeriod}
                    onChange={setFilterPeriod}
                    theme={theme}
                />
            </div>

            {/* Over-budget notification */}
            {exceeded.length > 0 && (
                <div role="alert" style={{
                    display: "flex", alignItems: "flex-start", gap: "1rem",
                    backgroundColor: f.colors.feedback.errorBg,
                    border: `1px solid ${f.colors.feedback.error}55`,
                    borderRadius: "1rem", padding: "1.4rem 1.6rem", margin: "1.6rem 0",
                }}>
                    <span style={{ color: f.colors.feedback.error, flexShrink: 0, marginTop: "0.1rem" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4M12 17h.01" />
                        </svg>
                    </span>
                    <div>
                        <strong style={{ fontSize: "1.4rem", color: f.colors.feedback.error }}>
                            {exceeded.length === 1 ? "1 orçamento ultrapassado" : `${exceeded.length} orçamentos ultrapassados`} no período
                        </strong>
                        <div style={{ fontSize: "1.3rem", color: f.colors.text.secondary, marginTop: "0.3rem" }}>
                            {exceeded.map((b) => `${b.name} (${fmt(b.spent)} / ${fmt(b.amount)})`).join(" · ")}
                        </div>
                    </div>
                </div>
            )}

            {/* Summary */}
            <div className="grid-responsive" style={{ ["--grid-cols"]: "repeat(3, 1fr)", gap: "1.4rem", marginTop: "1.6rem", marginBottom: "2rem" } as React.CSSProperties}>
                <div style={card}>
                    <span style={{ fontSize: "1.2rem", color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Orçado</span>
                    <div style={{ fontSize: "2.4rem", fontWeight: 800, color: f.colors.text.primary, marginTop: "0.4rem" }}>{fmt(totals.budgeted)}</div>
                </div>
                <div style={card}>
                    <span style={{ fontSize: "1.2rem", color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Gasto</span>
                    <div style={{ fontSize: "2.4rem", fontWeight: 800, color: f.colors.feedback.error, marginTop: "0.4rem" }}>{fmt(totals.spent)}</div>
                </div>
                <div style={card}>
                    <span style={{ fontSize: "1.2rem", color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Disponível</span>
                    <div style={{ fontSize: "2.4rem", fontWeight: 800, color: totals.remaining >= 0 ? f.colors.feedback.success : f.colors.feedback.error, marginTop: "0.4rem" }}>{fmt(totals.remaining)}</div>
                </div>
            </div>

            {/* Budget list */}
            {statuses.length === 0 ? (
                <div style={{ ...card, textAlign: "center", padding: "4rem 2rem", color: muted }}>
                    Nenhum orçamento ativo neste período. Clique em <strong style={{ color: primary }}>“+ Novo orçamento”</strong> para começar.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                    {statuses.map((b: BudgetStatus) => {
                        const pct = Math.min(b.percent, 100);
                        const barColor = b.exceeded ? f.colors.feedback.error : b.percent >= 80 ? f.colors.feedback.warning : primary;
                        return (
                            <div key={b.id} style={{ ...card, borderColor: b.exceeded ? `${f.colors.feedback.error}66` : border }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
                                            <h3 style={{ fontSize: "1.7rem", fontWeight: 700, color: f.colors.text.primary }}>{b.name}</h3>
                                            {b.exceeded && (
                                                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: f.colors.feedback.error, backgroundColor: f.colors.feedback.errorBg, padding: "0.2rem 0.7rem", borderRadius: "999px", border: `1px solid ${f.colors.feedback.error}55` }}>
                                                    Ultrapassado
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: "1.25rem", color: muted, marginTop: "0.2rem" }}>{b.scopeLabel}</p>
                                        <p style={{ fontSize: "1.15rem", color: muted, marginTop: "0.2rem" }}>Período: {b.periodLabel}</p>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "1.6rem", fontWeight: 700, color: f.colors.text.primary }}>
                                            {fmt(b.spent)} <span style={{ color: muted, fontWeight: 400 }}>/ {fmt(b.amount)}</span>
                                        </div>
                                        <div style={{ fontSize: "1.2rem", color: b.remaining >= 0 ? f.colors.feedback.success : f.colors.feedback.error }}>
                                            {b.remaining >= 0 ? `${fmt(b.remaining)} disponível` : `${fmt(Math.abs(b.remaining))} acima`}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: "1.2rem", height: "0.8rem", borderRadius: "999px", backgroundColor: isDark ? f.colors.bg.surface : f.colors.bg.elevated, overflow: "hidden" }}>
                                    <div style={{ width: `${pct}%`, height: "100%", backgroundColor: barColor, borderRadius: "999px", transition: "width 0.3s ease" }} />
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.8rem" }}>
                                    <span style={{ fontSize: "1.2rem", color: muted }}>{b.percent.toFixed(0)}% utilizado</span>
                                    <button
                                        type="button"
                                        onClick={() => removeBudget(b.id)}
                                        style={{ background: "none", border: "none", color: muted, cursor: "pointer", fontSize: "1.25rem", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                                        aria-label={`Excluir orçamento ${b.name}`}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                                        </svg>
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* New budget modal */}
            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                title="Novo orçamento"
                subtitle="Defina um limite para o período e seja avisado ao ultrapassá-lo"
                size="lg"
                theme={theme}
                footer={
                    <>
                        <button type="button" onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: muted, fontSize: "1.4rem", cursor: "pointer", fontFamily: "inherit", padding: "0 1.2rem" }}>
                            Cancelar
                        </button>
                        <Button label="Criar orçamento" type="button" theme={theme} variant="primary" size="md" onClick={handleSave}
                            styleConfig={{ backgroudColor: primary, textColor: "#fff", border: "none", borderRadius: "0.8rem", padding: "0 2.4rem" }} />
                    </>
                }
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                    <Input
                        id="budget-name" name="name" label="Nome do orçamento"
                        type="text" placeholder="Ex.: Alimentação — trimestre" value={form.name}
                        theme={theme} required error={errors.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    />

                    <div>
                        <label style={labelStyle}>Gerar orçamento por</label>
                        <select
                            value={form.scope}
                            onChange={(e) => setForm((p) => ({ ...p, scope: e.target.value as BudgetScope, refId: "" }))}
                            style={selectStyle}
                        >
                            {SCOPE_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                        </select>
                    </div>

                    {form.scope !== "global" && (
                        <div>
                            <label style={labelStyle}>
                                {form.scope === "category" ? "Setor / categoria" : form.scope === "method" ? "Forma de pagamento" : "Banco"}
                                {errors.refId && <span style={{ color: f.colors.feedback.error, fontWeight: 400 }}> — {errors.refId}</span>}
                            </label>
                            <select
                                value={form.refId}
                                onChange={(e) => setForm((p) => ({ ...p, refId: e.target.value }))}
                                style={{ ...selectStyle, borderColor: errors.refId ? f.colors.feedback.error : border }}
                            >
                                <option value="">Selecione...</option>
                                {refOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    )}

                    <Input
                        id="budget-amount" name="amount" label="Limite do período (R$)"
                        type="text" placeholder="0,00" value={form.amount}
                        theme={theme} required error={errors.amount}
                        onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    />

                    <div>
                        <label style={labelStyle}>
                            Período de referência
                            {errors.period && <span style={{ color: f.colors.feedback.error, fontWeight: 400 }}> — {errors.period}</span>}
                        </label>
                        <PeriodPicker
                            value={form.period}
                            onChange={(period) => setForm((p) => ({ ...p, period }))}
                            theme={theme}
                            error={errors.period}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
