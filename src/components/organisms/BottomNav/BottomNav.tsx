"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./BottomNav.module.css";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import type { ThemeMode } from "../../../shared/styles/theme.types";

// Menu inferior estilo app nativo — visível somente em telas de celular
// (ver breakpoint em BottomNav.module.css). Tablet e desktop continuam
// usando a Sidebar existente (topbar + drawer / sidebar persistente).
const ICONS: Record<string, React.ReactNode> = {
    LayoutDashboard: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
    ),
    ArrowLeftRight: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3 4 7l4 4"/><path d="M4 7h16"/>
            <path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>
        </svg>
    ),
    BarChart3: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
        </svg>
    ),
    MoreHorizontal: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
        </svg>
    ),
    Plus: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
        </svg>
    ),
};

type TabItem = {
    id: string;
    label: string;
    icon: string;
    href: string;
    exact: boolean;
};

const TABS: TabItem[] = [
    { id: "dashboard", label: "Painel", icon: "LayoutDashboard", href: "/dashboard", exact: true },
    { id: "movimentation", label: "Movimentações", icon: "ArrowLeftRight", href: "/dashboard/movimentation", exact: false },
    { id: "reports", label: "Relatórios", icon: "BarChart3", href: "/dashboard/reports", exact: false },
];

const MORE_HREF = "/dashboard/more";

type BottomNavProps = {
    theme?: ThemeMode;
};

export function BottomNav({ theme = "light" }: BottomNavProps) {
    const pathname = usePathname();
    const router = useRouter();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const isTabActive = (tab: TabItem) =>
        tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

    const isMoreActive = pathname.startsWith(MORE_HREF);

    return (
        <nav
            className={styles.bottomNav}
            style={{
                backgroundColor: isDark ? `${f.colors.bg.surface}F2` : "rgba(255,255,255,0.96)",
                borderTopColor: f.colors.border.default,
            }}
            aria-label="Navegação principal"
        >
            {TABS.slice(0, 2).map((tab) => {
                const active = isTabActive(tab);
                return (
                    <button
                        key={tab.id}
                        type="button"
                        className={styles.tab}
                        style={{ color: active ? f.colors.brand.primary : f.colors.text.muted }}
                        onClick={() => router.push(tab.href)}
                        aria-current={active ? "page" : undefined}
                    >
                        <span className={styles.tabIcon}>{ICONS[tab.icon]}</span>
                        <span className={styles.tabLabel}>{tab.label}</span>
                    </button>
                );
            })}

            <div className={styles.fabSlot}>
                <button
                    type="button"
                    className={styles.fabButton}
                    style={{ backgroundColor: f.colors.brand.primary, color: "#fff" }}
                    onClick={() => router.push("/dashboard/movimentation/transactions?new=1")}
                    aria-label="Nova movimentação"
                    title="Nova movimentação"
                >
                    {ICONS.Plus}
                </button>
            </div>

            {TABS.slice(2).map((tab) => {
                const active = isTabActive(tab);
                return (
                    <button
                        key={tab.id}
                        type="button"
                        className={styles.tab}
                        style={{ color: active ? f.colors.brand.primary : f.colors.text.muted }}
                        onClick={() => router.push(tab.href)}
                        aria-current={active ? "page" : undefined}
                    >
                        <span className={styles.tabIcon}>{ICONS[tab.icon]}</span>
                        <span className={styles.tabLabel}>{tab.label}</span>
                    </button>
                );
            })}

            <button
                type="button"
                className={styles.tab}
                style={{ color: isMoreActive ? f.colors.brand.primary : f.colors.text.muted }}
                onClick={() => router.push(MORE_HREF)}
                aria-current={isMoreActive ? "page" : undefined}
                aria-label="Mais opções"
            >
                <span className={styles.tabIcon}>{ICONS.MoreHorizontal}</span>
                <span className={styles.tabLabel}>Mais</span>
            </button>
        </nav>
    );
}
