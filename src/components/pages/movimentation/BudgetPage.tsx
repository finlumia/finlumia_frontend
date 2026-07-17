"use client";

import React, { useEffect, useMemo, useState } from "react";
import { parseMoney, maskCurrencyInput } from "../../../lib/money";
import { Modal } from "../../organisms/Modal";
import { Input } from "../../atoms/input";
import { Button } from "../../atoms/button";
import { PeriodPicker } from "../../organisms/PeriodPicker";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { useTheme } from "../../../shared/styles/theme.context";
import {
    useFinance, currentMonthPeriod,
    type BudgetScope, type BudgetType, type BudgetStatus, type DatePeriod,
} from "../../../shared/finance/finance.context";
import { budgetsService, type BudgetUpsertRequest } from "../../../services/movimentation/movement.service";
import { formatPeriodShort, isValidISO } from "../../../shared/finance/period.utils";

function fmt(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const TYPE_OPTIONS: { id: BudgetType; label: string }[] = [
    { id: "despesa", label: "Despesa (limite a não ultrapassar)" },
    { id: "receita", label: "Receita (meta a atingir)" },
];

const SCOPE_OPTIONS: { id: BudgetScope; label: (type: BudgetType) => string }[] = [
    { id: "geral", label: (t) => t === "receita" ? "Geral (todas as receitas)" : "Geral (todas as despesas)" },
    { id: "categoria", label: () => "Por setor / categoria" },
    { id: "forma_pagamento", label: () => "Por forma de pagamento" },
    { id: "banco", label: () => "Por banco" },
];

type FormState = {
    name: string;
    type: BudgetType;
    scope: BudgetScope;
    refId: string;
    amount: string;
    period: DatePeriod;
};

const emptyForm = (): FormState => ({
    name: "",
    type: "despesa",
    scope: "categoria",
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

    const { categories, paymentMethods, banks, appendBudget, removeBudget, budgetStatusFor, isLoadingBudgets, loadData } = useFinance();

    useEffect(() => { loadData(); }, [loadData]);

    const [filterPeriod, setFilterPeriod] = useState<DatePeriod>(currentMonthPeriod());
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<FormState>(emptyForm());
    const [errors, setErrors] = useState<Partial<Record<keyof FormState | "period", string>>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState("");

    const statuses = useMemo(() => budgetStatusFor(filterPeriod), [budgetStatusFor, filterPeriod]);
    const exceeded = statuses.filter((s) => s.exceeded);

    const totals = useMemo(() => {
        const budgeted = statuses.reduce((s, b) => s + b.limitAmount, 0);
        const spent = statuses.reduce((s, b) => s + b.currentTotal, 0);
        return { budgeted, spent, remaining: budgeted - spent };
    }, [statuses]);

    const primary = f.colors.brand.primary;
    const border = f.colors.border.default;
    const muted = f.colors.text.muted;
    const surface = isDark ? f.colors.bg.elevated : "#FFFFFF";

    const refOptions = useMemo(() => {
        if (form.scope === "categoria") {
            return categories
                .filter((c) => c.appliesTo === "ambos" || c.appliesTo === form.type)
                .map((c) => ({ value: c.id, label: c.label }));
        }
        if (form.scope === "forma_pagamento") return paymentMethods.map((m) => ({ value: m.id, label: m.label }));
        if (form.scope === "banco") return banks.map((b) => ({ value: b.id, label: b.label }));
        return [];
    }, [form.scope, form.type, categories, paymentMethods, banks]);

    const openNew = () => {
        setForm(emptyForm());
        setErrors({});
        setApiError("");
        setShowModal(true);
    };

    const handleSave = async () => {
        const e: typeof errors = {};
        if (!form.name.trim()) e.name = "Informe um nome.";
        const amount = parseMoney(form.amount);
        if (!form.amount || isNaN(amount) || amount <= 0) e.amount = "Informe um valor válido.";
        if (form.scope !== "geral" && !form.refId) e.refId = "Selecione uma opção.";
        const periodErr = validatePeriod(form.period);
        if (periodErr) e.period = periodErr;
        setErrors(e);
        if (Object.keys(e).length > 0) return;

        const payload: BudgetUpsertRequest = {
            name: form.name.trim(),
            type: form.type,
            scope: form.scope,
            scopeValue: form.scope === "geral" ? null : form.refId,
            limitAmount: amount,
            periodStart: form.period.start,
            periodEnd: form.period.end,
        };

        setIsSaving(true);
        setApiError("");
        try {
            const created = await budgetsService.create(payload);
            appendBudget(created);
            setShowModal(false);
        } catch (err: unknown) {
            setApiError((err as { message?: string })?.message ?? "Erro ao criar orçamento.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setApiError("");
        try {
            await budgetsService.delete(id);
            removeBudget(id);
        } catch (err: unknown) {
            setApiError((err as { message?: string })?.message ?? "Erro ao excluir orçamento.");
        }
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

            {apiError && (
                <div role="alert" style={{
                    backgroundColor: f.colors.feedback.errorBg, border: `1px solid ${f.colors.feedback.error}55`,
                    borderRadius: "1rem", padding: "1.2rem 1.6rem", margin: "1.6rem 0", color: f.colors.feedback.error, fontSize: "1.3rem",
                }}>
                    {apiError}
                </div>
            )}

            {/* Over-budget notification (despesas ultrapassadas no período) */}
            {exceeded.filter((b) => b.type === "despesa").length > 0 && (
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
                            {(() => {
                                const n = exceeded.filter((b) => b.type === "despesa").length;
                                return n === 1 ? "1 orçamento ultrapassado" : `${n} orçamentos ultrapassados`;
                            })()} no período
                        </strong>
                        <div style={{ fontSize: "1.3rem", color: f.colors.text.secondary, marginTop: "0.3rem" }}>
                            {exceeded.filter((b) => b.type === "despesa").map((b) => `${b.name} (${fmt(b.currentTotal)} / ${fmt(b.limitAmount)})`).join(" · ")}
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
                    {isLoadingBudgets ? "Carregando orçamentos..." : (
                        <>Nenhum orçamento ativo neste período. Clique em <strong style={{ color: primary }}>“+ Novo orçamento”</strong> para começar.</>
                    )}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                    {statuses.map((b: BudgetStatus) => {
                        const isReceita = b.type === "receita";
                        const pct = Math.min(b.progressPercent, 100);
                        const goalReached = isReceita && b.currentTotal >= b.limitAmount;
                        const barColor = b.exceeded && !isReceita ? f.colors.feedback.error
                            : goalReached ? f.colors.feedback.success
                            : b.progressPercent >= 80 ? f.colors.feedback.warning
                            : primary;
                        const highlightColor = b.exceeded && !isReceita ? f.colors.feedback.error : goalReached ? f.colors.feedback.success : undefined;
                        return (
                            <div key={b.id} style={{ ...card, borderColor: highlightColor ? `${highlightColor}66` : border }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
                                            <h3 style={{ fontSize: "1.7rem", fontWeight: 700, color: f.colors.text.primary }}>{b.name}</h3>
                                            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: muted, backgroundColor: isDark ? f.colors.bg.surface : f.colors.bg.elevated, padding: "0.2rem 0.7rem", borderRadius: "999px" }}>
                                                {isReceita ? "Receita" : "Despesa"}
                                            </span>
                                            {b.exceeded && !isReceita && (
                                                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: f.colors.feedback.error, backgroundColor: f.colors.feedback.errorBg, padding: "0.2rem 0.7rem", borderRadius: "999px", border: `1px solid ${f.colors.feedback.error}55` }}>
                                                    Ultrapassado
                                                </span>
                                            )}
                                            {goalReached && (
                                                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: f.colors.feedback.success, backgroundColor: `${f.colors.feedback.success}22`, padding: "0.2rem 0.7rem", borderRadius: "999px", border: `1px solid ${f.colors.feedback.success}55` }}>
                                                    Meta atingida
                                                </span>
                                            )}
                                            {b.notifiedAt && (
                                                <span style={{ fontSize: "1.1rem", fontWeight: 600, color: muted, border: `1px solid ${border}`, padding: "0.2rem 0.7rem", borderRadius: "999px" }}>
                                                    Alerta enviado
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: "1.25rem", color: muted, marginTop: "0.2rem" }}>{b.scopeLabel}</p>
                                        <p style={{ fontSize: "1.15rem", color: muted, marginTop: "0.2rem" }}>Período: {b.periodLabel}</p>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "1.6rem", fontWeight: 700, color: f.colors.text.primary }}>
                                            {fmt(b.currentTotal)} <span style={{ color: muted, fontWeight: 400 }}>/ {fmt(b.limitAmount)}</span>
                                        </div>
                                        <div style={{ fontSize: "1.2rem", color: isReceita ? muted : (b.remaining >= 0 ? f.colors.feedback.success : f.colors.feedback.error) }}>
                                            {isReceita
                                                ? (b.remaining > 0 ? `${fmt(b.remaining)} para a meta` : "Meta atingida")
                                                : (b.remaining >= 0 ? `${fmt(b.remaining)} disponível` : `${fmt(Math.abs(b.remaining))} acima`)}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: "1.2rem", height: "0.8rem", borderRadius: "999px", backgroundColor: isDark ? f.colors.bg.surface : f.colors.bg.elevated, overflow: "hidden" }}>
                                    <div style={{ width: `${pct}%`, height: "100%", backgroundColor: barColor, borderRadius: "999px", transition: "width 0.3s ease" }} />
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.8rem" }}>
                                    <span style={{ fontSize: "1.2rem", color: muted }}>{b.progressPercent.toFixed(0)}% {isReceita ? "da meta" : "utilizado"}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(b.id)}
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
                subtitle="Defina um limite (despesa) ou uma meta (receita) para o período e seja avisado por e-mail"
                size="lg"
                theme={theme}
                footer={
                    <>
                        <button type="button" onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: muted, fontSize: "1.4rem", cursor: "pointer", fontFamily: "inherit", padding: "0 1.2rem" }}>
                            Cancelar
                        </button>
                        <Button label={isSaving ? "Criando..." : "Criar orçamento"} type="button" theme={theme} variant="primary" size="md" onClick={handleSave} disabled={isSaving}
                            styleConfig={{ backgroudColor: primary, textColor: "#fff", border: "none", borderRadius: "0.8rem", padding: "0 2.4rem" }} />
                    </>
                }
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                    {apiError && (
                        <div role="alert" style={{ color: f.colors.feedback.error, fontSize: "1.3rem" }}>{apiError}</div>
                    )}

                    <Input
                        id="budget-name" name="name" label="Nome do orçamento"
                        type="text" placeholder="Ex.: Alimentação — trimestre" value={form.name}
                        theme={theme} required error={errors.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    />

                    <div>
                        <label style={labelStyle}>Tipo</label>
                        <select
                            value={form.type}
                            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as BudgetType, refId: "" }))}
                            style={selectStyle}
                        >
                            {TYPE_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>Gerar orçamento por</label>
                        <select
                            value={form.scope}
                            onChange={(e) => setForm((p) => ({ ...p, scope: e.target.value as BudgetScope, refId: "" }))}
                            style={selectStyle}
                        >
                            {SCOPE_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label(form.type)}</option>)}
                        </select>
                    </div>

                    {form.scope !== "geral" && (
                        <div>
                            <label style={labelStyle}>
                                {form.scope === "categoria" ? "Setor / categoria" : form.scope === "forma_pagamento" ? "Forma de pagamento" : "Banco"}
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
                        id="budget-amount" name="amount" label={form.type === "receita" ? "Meta do período (R$)" : "Limite do período (R$)"}
                        type="text" placeholder="0,00" value={form.amount}
                        theme={theme} required error={errors.amount}
                        onChange={(e) => setForm((p) => ({ ...p, amount: maskCurrencyInput(e.target.value) }))}
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
