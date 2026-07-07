"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { Input } from "../../atoms/input";
import { Button } from "../../atoms/button";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import type { ThemeMode } from "../../../shared/styles/theme.types";

// ── Field types ────────────────────────────────────────────────────────────

export type FieldType = "text" | "email" | "password" | "number" | "select" | "toggle" | "textarea" | "badge-select";

export type SelectOption = { value: string; label: string };

export type FormField = {
    key: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;
    options?: SelectOption[];                   // for select / badge-select
    hint?: string;
    span?: "full" | "half";                     // grid span (default half)
    badgeColor?: (value: string) => string;     // for badge-select
};

// ── Component ──────────────────────────────────────────────────────────────

type CrudModalProps = {
    open: boolean;
    onClose: () => void;
    onSave: (data: Record<string, unknown>) => void;
    title: string;
    subtitle?: string;
    fields: FormField[];
    initial?: Record<string, unknown>;
    theme?: ThemeMode;
    isEdit?: boolean;
};

export function CrudModal({
    open, onClose, onSave,
    title, subtitle, fields,
    initial = {}, theme = "dark", isEdit = false,
}: CrudModalProps) {
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const emptyForm = () => fields.reduce<Record<string, unknown>>((acc, field) => {
        acc[field.key] = initial[field.key] ?? (field.type === "toggle" ? false : "");
        return acc;
    }, {});

    const [form, setForm] = useState<Record<string, unknown>>(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reresseta o formulário apenas na transição para aberto — nunca a cada
    // keystroke. `initial` não pode entrar nas deps: como as telas de criação
    // não passam essa prop, o valor default `initial = {}` gera uma referência
    // NOVA a cada re-render (inclusive o causado por onChange), o que fazia o
    // effect rodar de novo e apagar o caractere recém-digitado a cada tecla.
    useEffect(() => {
        if (open) {
            setForm(emptyForm());
            setErrors({});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const set = (key: string, value: unknown) =>
        setForm((p) => ({ ...p, [key]: value }));

    const validate = () => {
        const errs: Record<string, string> = {};
        fields.forEach((field) => {
            if (field.required && !form[field.key]) {
                errs[field.key] = `${field.label} é obrigatório.`;
            }
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        onSave(form);
        onClose();
    };

    const primary = f.colors.brand.primary;
    const border = f.colors.border.default;
    const muted = f.colors.text.muted;

    const chipBase: React.CSSProperties = {
        display: "inline-flex", alignItems: "center",
        padding: "0.4rem 1rem", borderRadius: "999px",
        fontSize: "1.2rem", fontWeight: 500, cursor: "pointer",
        border: "1.5px solid", transition: "all 0.15s ease",
        fontFamily: f.typography.fontFamily.base, background: "none",
        userSelect: "none",
    };

    const footer = (
        <>
            <button type="button" onClick={onClose} style={{
                background: "none", border: "none", color: muted,
                fontSize: "1.4rem", cursor: "pointer", fontFamily: "inherit", padding: "0 1.2rem",
            }}>
                Cancelar
            </button>
            <Button
                label={isEdit ? "Salvar alterações" : "Criar registro"}
                type="button" theme={theme} variant="primary" size="md"
                onClick={handleSave}
                styleConfig={{ backgroudColor: primary, textColor: "#fff", border: "none", borderRadius: "0.8rem", padding: "0 2.4rem" }}
            />
        </>
    );

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            subtitle={subtitle}
            size="md"
            theme={theme}
            footer={footer}
        >
            {/* 2-column grid layout */}
            <div className="grid-pair" style={{ gap: "1.4rem" }}>
                {fields.map((field) => {
                    const val = form[field.key];
                    const err = errors[field.key];
                    const fullSpan = field.span === "full" || field.type === "textarea" || field.type === "badge-select";

                    const wrapper: React.CSSProperties = fullSpan
                        ? { gridColumn: "1 / -1" }
                        : {};

                    // ── toggle ──
                    if (field.type === "toggle") {
                        const checked = !!val;
                        return (
                            <div key={field.key} style={wrapper}>
                                <label style={{ display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer" }}>
                                    <div
                                        onClick={() => set(field.key, !checked)}
                                        style={{
                                            width: "4rem", height: "2.2rem", borderRadius: "999px",
                                            backgroundColor: checked ? primary : border,
                                            position: "relative", transition: "background-color 0.2s ease",
                                            cursor: "pointer", flexShrink: 0,
                                        }}
                                    >
                                        <div style={{
                                            position: "absolute", top: "0.2rem",
                                            left: checked ? "1.9rem" : "0.2rem",
                                            width: "1.8rem", height: "1.8rem",
                                            borderRadius: "50%", backgroundColor: "#fff",
                                            transition: "left 0.2s ease",
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                        }} />
                                    </div>
                                    <span style={{ fontSize: "1.3rem", fontWeight: 500, color: f.colors.text.secondary }}>
                                        {field.label}
                                    </span>
                                    {field.hint && (
                                        <span style={{ fontSize: "1.1rem", color: muted }}>({field.hint})</span>
                                    )}
                                </label>
                            </div>
                        );
                    }

                    // ── select (native) ──
                    if (field.type === "select") {
                        return (
                            <div key={field.key} style={wrapper}>
                                <label style={{ display: "block", fontSize: "1.3rem", fontWeight: 500, color: f.colors.text.secondary, marginBottom: "0.5rem" }}>
                                    {field.label}{field.required && <span style={{ color: f.colors.feedback.error }}> *</span>}
                                </label>
                                <select
                                    value={String(val ?? "")}
                                    onChange={(e) => set(field.key, e.target.value)}
                                    style={{
                                        width: "100%", height: "4rem",
                                        padding: "0 1.2rem",
                                        borderRadius: "0.8rem",
                                        border: `1px solid ${err ? f.colors.feedback.error : border}`,
                                        backgroundColor: isDark ? f.colors.bg.elevated : "#fff",
                                        color: val ? f.colors.text.primary : muted,
                                        fontSize: "1.3rem", fontFamily: "inherit",
                                        cursor: "pointer", outline: "none",
                                    }}
                                >
                                    <option value="">{field.placeholder ?? `Selecione ${field.label}`}</option>
                                    {field.options?.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {err && <span style={{ fontSize: "1.1rem", color: f.colors.feedback.error, marginTop: "0.3rem", display: "block" }}>⚠ {err}</span>}
                            </div>
                        );
                    }

                    // ── badge-select (chip group) ──
                    if (field.type === "badge-select") {
                        return (
                            <div key={field.key} style={wrapper}>
                                <label style={{ display: "block", fontSize: "1.3rem", fontWeight: 500, color: f.colors.text.secondary, marginBottom: "0.8rem" }}>
                                    {field.label}{field.required && <span style={{ color: f.colors.feedback.error }}> *</span>}
                                </label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                                    {field.options?.map((opt) => {
                                        const isActive = val === opt.value;
                                        const color = field.badgeColor?.(opt.value) ?? primary;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => set(field.key, opt.value)}
                                                style={isActive
                                                    ? { ...chipBase, backgroundColor: `${color}20`, borderColor: color, color }
                                                    : { ...chipBase, borderColor: border, color: muted }
                                                }
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                {err && <span style={{ fontSize: "1.1rem", color: f.colors.feedback.error, marginTop: "0.4rem", display: "block" }}>⚠ {err}</span>}
                            </div>
                        );
                    }

                    // ── textarea ──
                    if (field.type === "textarea") {
                        return (
                            <div key={field.key} style={wrapper}>
                                <label style={{ display: "block", fontSize: "1.3rem", fontWeight: 500, color: f.colors.text.secondary, marginBottom: "0.5rem" }}>
                                    {field.label}{field.required && <span style={{ color: f.colors.feedback.error }}> *</span>}
                                </label>
                                <textarea
                                    placeholder={field.placeholder}
                                    value={String(val ?? "")}
                                    rows={4}
                                    onChange={(e) => set(field.key, e.target.value)}
                                    style={{
                                        width: "100%", padding: "0.8rem 1.2rem",
                                        borderRadius: "0.8rem",
                                        border: `1px solid ${err ? f.colors.feedback.error : border}`,
                                        backgroundColor: isDark ? f.colors.bg.elevated : "#fff",
                                        color: f.colors.text.primary,
                                        fontSize: "1.3rem", fontFamily: "inherit",
                                        resize: "vertical", outline: "none",
                                    }}
                                />
                                {err && <span style={{ fontSize: "1.1rem", color: f.colors.feedback.error, marginTop: "0.3rem", display: "block" }}>⚠ {err}</span>}
                            </div>
                        );
                    }

                    // ── text / email / number / password (use Input atom) ──
                    return (
                        <div key={field.key} style={wrapper}>
                            <Input
                                id={`crud-${field.key}`}
                                name={field.key}
                                label={field.label}
                                type={field.type as "text" | "email" | "password" | "number"}
                                placeholder={field.placeholder}
                                value={String(val ?? "")}
                                required={field.required}
                                error={err}
                                helper={field.hint}
                                theme={theme}
                                onChange={(e) => set(field.key, e.target.value)}
                            />
                        </div>
                    );
                })}
            </div>
        </Modal>
    );
}
