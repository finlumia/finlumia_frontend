"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { ThemeMode } from "../../../shared/styles/theme.types";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import type { Status } from "../../../config/configurator";

// ── Status badge ────────────────────────────────────────────────────────────

type StatusBadgeProps = { status: Status; f: ReturnType<typeof getFoundationByTheme>; isDark: boolean };

export function StatusBadge({ status, f, isDark }: StatusBadgeProps) {
    const map: Record<Status, { label: string; color: string; bg: string }> = {
        ativo:    { label: "Ativo",    color: f.colors.feedback.success, bg: isDark ? f.colors.feedback.successBg : "#E6F4ED" },
        inativo:  { label: "Inativo",  color: f.colors.text.muted,       bg: isDark ? f.colors.bg.elevated       : f.colors.bg.elevated },
        pendente: { label: "Pendente", color: f.colors.feedback.warning,  bg: isDark ? f.colors.feedback.warningBg : "#FFF3E0" },
        erro:     { label: "Erro",     color: f.colors.feedback.error,    bg: isDark ? f.colors.feedback.errorBg  : "#FEE2E2" },
    };
    const s = map[status];
    return (
        <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "0.2rem 0.7rem", borderRadius: "999px",
            fontSize: "1.1rem", fontWeight: 600, letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: s.color, backgroundColor: s.bg,
            border: `1px solid ${s.color}40`,
        }}>
            {s.label}
        </span>
    );
}

// ── Boolean tick/cross ──────────────────────────────────────────────────────

export function BoolBadge({ value, f }: { value: boolean; f: ReturnType<typeof getFoundationByTheme> }) {
    return value ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={f.colors.feedback.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5"/>
        </svg>
    ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={f.colors.text.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
    );
}

// ── Code chip ───────────────────────────────────────────────────────────────

export function CodeChip({ value, f }: { value: string; f: ReturnType<typeof getFoundationByTheme> }) {
    return (
        <code style={{
            fontSize: "1.1rem", fontFamily: "ui-monospace, monospace",
            backgroundColor: `${f.colors.brand.primary}15`,
            color: f.colors.brand.primary,
            padding: "0.15rem 0.5rem", borderRadius: "0.4rem",
        }}>
            {value}
        </code>
    );
}

// ── Configurator sub-nav tabs ───────────────────────────────────────────────

type ConfigTab = { id: string; label: string; href: string; icon: string };

const TABS: ConfigTab[] = [
    { id: "tables",      label: "Tabelas",    href: "/dashboard/configurator/tables",      icon: "⊞" },
    { id: "fields",      label: "Campos",     href: "/dashboard/configurator/fields",      icon: "⊟" },
    { id: "users",       label: "Usuários",   href: "/dashboard/configurator/users",       icon: "👤" },
    { id: "permissions", label: "Permissões", href: "/dashboard/configurator/permissions", icon: "🔒" },
    { id: "functions",   label: "Funções",    href: "/dashboard/configurator/functions",   icon: "λ" },
    { id: "indexes",     label: "Índices",    href: "/dashboard/configurator/indexes",     icon: "⚡" },
    { id: "triggers",    label: "Triggers",   href: "/dashboard/configurator/triggers",    icon: "⚙" },
];

type ConfigLayoutProps = {
    activeTab: string;
    theme: ThemeMode;
    children: React.ReactNode;
};

export function ConfigLayout({ activeTab, theme, children }: ConfigLayoutProps) {
    const router = useRouter();
    const f = getFoundationByTheme(theme);

    const primary = f.colors.brand.primary;
    const border = f.colors.border.default;
    const muted = f.colors.text.muted;

    return (
        <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, maxWidth: "140rem" }}>
            {/* Page header */}
            <div style={{ marginBottom: "2rem" }}>
                <p style={{ fontSize: "1.2rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: muted, marginBottom: "0.4rem" }}>
                    Sistema
                </p>
                <h1 style={{ fontSize: "2.8rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "1.6rem" }}>
                    Configurador
                </h1>

                {/* Tab bar */}
                <div style={{
                    display: "flex", gap: "0", overflowX: "auto",
                    borderBottom: `2px solid ${border}`,
                    paddingBottom: "0",
                    scrollbarWidth: "none",
                }}>
                    {TABS.map((tab) => {
                        const isActive = tab.id === activeTab;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => router.push(tab.href)}
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                                    padding: "0.8rem 1.4rem",
                                    borderBottom: isActive ? `2px solid ${primary}` : "2px solid transparent",
                                    marginBottom: "-2px",
                                    background: "none", border: "none",
                                    color: isActive ? primary : muted,
                                    fontSize: "1.3rem", fontWeight: isActive ? 600 : 400,
                                    cursor: "pointer", fontFamily: "inherit",
                                    whiteSpace: "nowrap",
                                    transition: "color 0.15s ease, border-color 0.15s ease",
                                }}
                            >
                                <span style={{ fontSize: "1rem" }}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {children}
        </div>
    );
}
