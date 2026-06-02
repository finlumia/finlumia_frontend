"use client";

import React, { useState } from "react";
import { Modal } from "../Modal";
import { Input } from "../../atoms/input";
import { Button } from "../../atoms/button";
import {
    type Transaction, type TransactionType,
} from "../../../config/transactions";
import { useFinance } from "../../../shared/finance/finance.context";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import type { ThemeMode } from "../../../shared/styles/theme.types";

type Step = 1 | 2;

type FormData = {
    type: TransactionType;
    method: string;
    institution: string;
    date: string;
    category: string;
    description: string;
    amount: string;
    notes: string;
};

const EMPTY: FormData = {
    type: "despesa",
    method: "",
    institution: "",
    date: new Date().toISOString().slice(0, 10),
    category: "",
    description: "",
    amount: "",
    notes: "",
};

type NewTransactionModalProps = {
    open: boolean;
    onClose: () => void;
    onSave: (t: Omit<Transaction, "id">) => void;
    theme?: ThemeMode;
};

export function NewTransactionModal({ open, onClose, onSave, theme = "dark" }: NewTransactionModalProps) {
    const f = getFoundationByTheme(theme);
    const { categories, banks, paymentMethods } = useFinance();
    const [step, setStep] = useState<Step>(1);
    const [form, setForm] = useState<FormData>(EMPTY);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

    const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
        setForm((p) => ({ ...p, [key]: value }));

    const validateStep1 = () => {
        const e: typeof errors = {};
        if (!form.method) e.method = "Selecione o método de pagamento.";
        if (!form.institution) e.institution = "Selecione a instituição.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep2 = () => {
        const e: typeof errors = {};
        if (!form.date) e.date = "Informe a data.";
        if (!form.category) e.category = "Selecione a categoria.";
        if (!form.description.trim()) e.description = "Informe a descrição.";
        const amt = parseFloat(form.amount.replace(",", "."));
        if (!form.amount || isNaN(amt) || amt <= 0) e.amount = "Informe um valor válido.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleClose = () => {
        setStep(1);
        setForm(EMPTY);
        setErrors({});
        onClose();
    };

    const handleSave = () => {
        if (!validateStep2()) return;
        onSave({
            type: form.type,
            method: form.method,
            institution: form.institution,
            date: form.date,
            category: form.category,
            description: form.description,
            amount: parseFloat(form.amount.replace(",", ".")),
            notes: form.notes || undefined,
        });
        handleClose();
    };

    const primaryColor = f.colors.brand.primary;
    const textMuted = f.colors.text.muted;
    const borderColor = f.colors.border.default;
    const isDark = theme === "dark";

    const chipBase: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 1.2rem",
        borderRadius: "999px",
        fontSize: "1.3rem",
        fontWeight: 500,
        cursor: "pointer",
        border: `1.5px solid`,
        transition: "all 0.15s ease",
        fontFamily: f.typography.fontFamily.base,
        userSelect: "none",
    };

    const activeChip = (color: string): React.CSSProperties => ({
        ...chipBase,
        backgroundColor: isDark ? `${color}20` : `${color}15`,
        borderColor: color,
        color: color,
    });

    const inactiveChip: React.CSSProperties = {
        ...chipBase,
        backgroundColor: "transparent",
        borderColor: borderColor,
        color: textMuted,
    };

    const footer = step === 1 ? (
        <>
            <button
                type="button"
                onClick={handleClose}
                style={{ background: "none", border: "none", color: textMuted, fontSize: "1.4rem", cursor: "pointer", fontFamily: "inherit", padding: "0 1.2rem" }}
            >
                Cancelar
            </button>
            <Button
                label="Próximo →"
                type="button"
                theme={theme}
                variant="primary"
                size="md"
                onClick={() => { if (validateStep1()) setStep(2); }}
                styleConfig={{ backgroudColor: primaryColor, textColor: "#fff", border: "none", borderRadius: "0.8rem", padding: "0 2.4rem" }}
            />
        </>
    ) : (
        <>
            <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: "none", border: "none", color: textMuted, fontSize: "1.4rem", cursor: "pointer", fontFamily: "inherit", padding: "0 1.2rem" }}
            >
                ← Voltar
            </button>
            <Button
                label="Salvar lançamento"
                type="button"
                theme={theme}
                variant="primary"
                size="md"
                onClick={handleSave}
                styleConfig={{ backgroudColor: primaryColor, textColor: "#fff", border: "none", borderRadius: "0.8rem", padding: "0 2.4rem" }}
            />
        </>
    );

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Novo lançamento"
            subtitle="Movimentações"
            size="md"
            theme={theme}
            footer={footer}
        >
            {/* Step indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "2rem" }}>
                {([1, 2] as Step[]).map((s) => (
                    <React.Fragment key={s}>
                        <div style={{
                            width: "2.8rem", height: "2.8rem", borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1.2rem", fontWeight: 700,
                            backgroundColor: step >= s ? primaryColor : (isDark ? f.colors.bg.surface : f.colors.bg.elevated),
                            color: step >= s ? "#fff" : textMuted,
                            border: `2px solid ${step >= s ? primaryColor : borderColor}`,
                            transition: "all 0.2s ease",
                        }}>
                            {s}
                        </div>
                        {s < 2 && (
                            <div style={{
                                flex: 1, height: "2px",
                                backgroundColor: step > s ? primaryColor : borderColor,
                                transition: "background-color 0.2s ease",
                            }} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* ── STEP 1 ── */}
            {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

                    {/* Tipo */}
                    <div>
                        <label style={{ display: "block", fontSize: "1.3rem", fontWeight: 500, color: f.colors.text.secondary, marginBottom: "0.8rem" }}>
                            Tipo de transação
                        </label>
                        <div style={{ display: "flex", gap: "0.8rem" }}>
                            {(["receita", "despesa"] as TransactionType[]).map((t) => {
                                const isActive = form.type === t;
                                const color = t === "receita" ? f.colors.feedback.success : f.colors.feedback.error;
                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => set("type", t)}
                                        style={isActive ? activeChip(color) : inactiveChip}
                                    >
                                        {t === "receita" ? "▲ Receita" : "▼ Despesa"}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Método */}
                    <div>
                        <label style={{ display: "block", fontSize: "1.3rem", fontWeight: 500, color: f.colors.text.secondary, marginBottom: "0.8rem" }}>
                            Método de pagamento {errors.method && <span style={{ color: f.colors.feedback.error, fontWeight: 400 }}>— {errors.method}</span>}
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                            {paymentMethods.map((m) => {
                                const isActive = form.method === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => set("method", m.id)}
                                        style={isActive ? activeChip(primaryColor) : inactiveChip}
                                    >
                                        {m.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Instituição */}
                    <div>
                        <label style={{ display: "block", fontSize: "1.3rem", fontWeight: 500, color: f.colors.text.secondary, marginBottom: "0.8rem" }}>
                            Instituição financeira {errors.institution && <span style={{ color: f.colors.feedback.error, fontWeight: 400 }}>— {errors.institution}</span>}
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
                            {banks.map((inst) => {
                                const isActive = form.institution === inst.id;
                                return (
                                    <button
                                        key={inst.id}
                                        type="button"
                                        title={inst.label}
                                        onClick={() => set("institution", inst.id)}
                                        style={{
                                            width: "4.4rem",
                                            height: "4.4rem",
                                            borderRadius: "1rem",
                                            border: `2px solid ${isActive ? inst.color : borderColor}`,
                                            backgroundColor: isActive ? inst.color : (isDark ? f.colors.bg.surface : f.colors.bg.elevated),
                                            color: isActive ? "#fff" : textMuted,
                                            fontSize: "1.1rem",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            transition: "all 0.15s ease",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontFamily: "inherit",
                                            flexShrink: 0,
                                        }}
                                        aria-pressed={isActive}
                                        aria-label={inst.label}
                                    >
                                        {inst.abbr}
                                    </button>
                                );
                            })}
                        </div>
                        {form.institution && (
                            <p style={{ fontSize: "1.2rem", color: textMuted, marginTop: "0.4rem" }}>
                                ✓ {banks.find((i) => i.id === form.institution)?.label}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                    <Input
                        id="tx-date"
                        name="date"
                        label="Data da transação"
                        type="text"
                        placeholder="yyyy-mm-dd"
                        value={form.date}
                        theme={theme}
                        error={errors.date}
                        required
                        onChange={(e) => set("date", e.target.value)}
                    />

                    {/* Categoria */}
                    <div>
                        <label style={{ display: "block", fontSize: "1.3rem", fontWeight: 500, color: f.colors.text.secondary, marginBottom: "0.8rem" }}>
                            Categoria {errors.category && <span style={{ color: f.colors.feedback.error, fontWeight: 400 }}>— {errors.category}</span>}
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                            {categories.map((cat) => {
                                const isActive = form.category === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => set("category", cat.id)}
                                        style={isActive
                                            ? { ...chipBase, backgroundColor: isDark ? cat.bgColor : `${cat.color}18`, borderColor: cat.color, color: cat.color }
                                            : inactiveChip
                                        }
                                    >
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <Input
                        id="tx-description"
                        name="description"
                        label="Descrição"
                        type="text"
                        placeholder="Ex: Mercado, Salário, Assinatura..."
                        value={form.description}
                        theme={theme}
                        error={errors.description}
                        required
                        onChange={(e) => set("description", e.target.value)}
                    />

                    <Input
                        id="tx-amount"
                        name="amount"
                        label="Valor (R$)"
                        type="text"
                        placeholder="0,00"
                        value={form.amount}
                        theme={theme}
                        error={errors.amount}
                        required
                        onChange={(e) => set("amount", e.target.value)}
                    />

                    <Input
                        id="tx-notes"
                        name="notes"
                        label="Observações (opcional)"
                        type="text"
                        placeholder="Informações adicionais..."
                        value={form.notes}
                        theme={theme}
                        onChange={(e) => set("notes", e.target.value)}
                    />
                </div>
            )}
        </Modal>
    );
}
