"use client";

import React, { useEffect } from "react";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import type { ThemeMode } from "../../../shared/styles/theme.types";

export type FeedbackKind = "receita" | "despesa" | "investimento";

type TransactionFeedbackProps = {
    kind: FeedbackKind | null;
    description?: string;
    onDone: () => void;
    theme?: ThemeMode;
    durationMs?: number;
};

const COPY: Record<FeedbackKind, { label: string; icon: React.ReactNode }> = {
    receita: {
        label: "Receita lançada",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
        ),
    },
    despesa: {
        label: "Despesa lançada",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
        ),
    },
    investimento: {
        label: "Investimento registrado",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
                <circle cx="12" cy="12" r="4" />
            </svg>
        ),
    },
};

/** Toast animado exibido ao criar uma movimentação — cor/ícone/animação
 * mudam conforme o tipo, para reforçar visualmente receita x despesa x
 * investimento no exato momento do lançamento. */
export function TransactionFeedback({ kind, description, onDone, theme = "dark", durationMs = 2400 }: TransactionFeedbackProps) {
    const f = getFoundationByTheme(theme);

    useEffect(() => {
        if (!kind) return;
        const t = window.setTimeout(onDone, durationMs);
        return () => window.clearTimeout(t);
    }, [kind, durationMs, onDone]);

    if (!kind) return null;

    const color = kind === "despesa"
        ? f.colors.feedback.error
        : kind === "investimento"
            ? "#FFB74D"
            : f.colors.feedback.success;

    const animationName = kind === "despesa" ? "finlumia-toast-drop" : kind === "investimento" ? "finlumia-toast-sparkle" : "finlumia-toast-rise";

    return (
        <div
            role="status"
            aria-live="polite"
            style={{
                position: "fixed", top: "2rem", right: "2rem", zIndex: 9999,
                display: "flex", alignItems: "center", gap: "1.2rem",
                padding: "1.2rem 1.8rem", borderRadius: "1rem",
                backgroundColor: theme === "dark" ? f.colors.bg.elevated : "#fff",
                border: `1px solid ${color}`,
                boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
                animation: `${animationName} ${durationMs}ms ease forwards`,
                fontFamily: f.typography.fontFamily.base,
            }}
        >
            <span style={{
                width: "4rem", height: "4rem", borderRadius: "50%",
                backgroundColor: `${color}22`, color,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                animation: kind === "investimento" ? "finlumia-sparkle-spin 1.8s ease-in-out" : undefined,
            }}>
                {COPY[kind].icon}
            </span>
            <div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: f.colors.text.primary }}>
                    {COPY[kind].label}
                </div>
                {description && (
                    <div style={{ fontSize: "1.2rem", color: f.colors.text.muted }}>{description}</div>
                )}
            </div>

            <style>{`
                @keyframes finlumia-toast-rise {
                    0%   { opacity: 0; transform: translateY(1.2rem) scale(0.96); }
                    12%  { opacity: 1; transform: translateY(-0.3rem) scale(1.02); }
                    20%  { transform: translateY(0) scale(1); }
                    85%  { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(-0.8rem) scale(0.98); }
                }
                @keyframes finlumia-toast-drop {
                    0%   { opacity: 0; transform: translateY(-1.2rem) scale(0.96); }
                    12%  { opacity: 1; transform: translateY(0.3rem) scale(1.02); }
                    20%  { transform: translateY(0) scale(1); }
                    85%  { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(0.8rem) scale(0.98); }
                }
                @keyframes finlumia-toast-sparkle {
                    0%   { opacity: 0; transform: scale(0.9); }
                    15%  { opacity: 1; transform: scale(1.04); }
                    25%  { transform: scale(1); }
                    85%  { opacity: 1; transform: scale(1); }
                    100% { opacity: 0; transform: scale(0.97); }
                }
                @keyframes finlumia-sparkle-spin {
                    0%   { transform: rotate(0deg) scale(1); }
                    50%  { transform: rotate(180deg) scale(1.15); }
                    100% { transform: rotate(360deg) scale(1); }
                }
            `}</style>
        </div>
    );
}
