"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Sidebar.module.css";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import type { ThemeMode } from "../../../shared/styles/theme.types";
import { useTheme } from "../../../shared/styles/theme.context";
import navigationConfig from "../../../config/navigation.json";
import { useTour } from "../../../contexts/tour.context";
import { useAuth } from "../../../contexts/auth.context";

// Itens visíveis somente para administradores — o Configurador manipula
// estrutura de banco, usuários e permissões, então fica oculto do menu (e
// bloqueado por rota, ver src/app/dashboard/configurator/layout.tsx) para
// quem não é admin.
const ADMIN_ONLY_NAV_IDS = new Set(["configurator"]);

// Itens filhos visíveis só para admin/gerente — mesma regra de acesso
// aplicada dentro da própria página (ver SupportPortalPage.tsx). Fica oculto
// do menu para usuário final, que só veria a tela de "Acesso restrito".
const MANAGER_ONLY_CHILD_NAV_IDS = new Set(["support-portal"]);

// ── Types ──────────────────────────────────────────────────────────────────

type ChildItem = {
    id: string;
    label: string;
    icon: string;
    href: string;
};

type NavItem = {
    id: string;
    label: string;
    icon: string;
    href: string;
    exact: boolean;
    badge?: string | null;
    children: ChildItem[];
};

type NavGroup = {
    id: string;
    label: string | null;
    items: NavItem[];
};

// ── Theme helpers ──────────────────────────────────────────────────────────

const THEME_META: Record<ThemeMode, { label: string; next: string }> = {
    light:      { label: "Modo claro",       next: "Modo escuro" },
    dark:       { label: "Modo escuro",      next: "Daltonismo" },
    colorblind: { label: "Daltonismo (CUD)", next: "Modo claro" },
};

// ── Icon registry ──────────────────────────────────────────────────────────

const ICONS: Record<string, React.ReactNode> = {
    LayoutDashboard: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
    ),
    Settings2: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7h-9"/><path d="M14 17H5"/>
            <circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>
        </svg>
    ),
    ArrowLeftRight: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3 4 7l4 4"/><path d="M4 7h16"/>
            <path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>
        </svg>
    ),
    BarChart3: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
        </svg>
    ),
    Receipt: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
            <path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/>
        </svg>
    ),
    PiggyBank: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2z"/>
            <path d="M2 9v1a2 2 0 0 0 2 2h1"/><path d="M16 11h.01"/>
        </svg>
    ),
    Tags: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 5 7.5 7.5a2.12 2.12 0 0 1 0 3L13 19l-7.5-7.5a2 2 0 0 1-.5-1.4V5a2 2 0 0 1 2-2h2.6a2 2 0 0 1 1.4.5Z"/>
            <circle cx="9.5" cy="7.5" r="1"/>
        </svg>
    ),
    Landmark: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/>
            <line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/>
            <line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>
        </svg>
    ),
    CreditCard: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
    ),
    Ticket: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9a2 2 0 0 1 2-2h14l-2 4 2 4H5a2 2 0 0 1-2-2Z"/><path d="M13 5v14"/>
        </svg>
    ),
    BookOpen: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4h7a2 2 0 0 1 2 2v14H4a2 2 0 0 1-2-2Z"/><path d="M22 4h-7a2 2 0 0 0-2 2v14h7a2 2 0 0 0 2-2Z"/>
        </svg>
    ),
    LifeBuoy: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
            <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/>
            <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/>
            <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/>
            <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/>
        </svg>
    ),
    Table2: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
        </svg>
    ),
    Columns3: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/>
        </svg>
    ),
    Users: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    ),
    ShieldCheck: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
        </svg>
    ),
    Code2: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>
        </svg>
    ),
    Layers: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
            <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
            <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
        </svg>
    ),
    Zap: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
    ),
    Inbox: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
            <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
        </svg>
    ),
    GraduationCap: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
    ),
    ScrollText: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/>
            <path d="M19 3H9a2 2 0 0 0-2 2v12h14V5a2 2 0 0 0-2-2z"/>
            <path d="M11 7h6"/><path d="M11 11h6"/><path d="M11 15h3"/>
        </svg>
    ),
    Terminal: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 17 10 11 4 5"/>
            <line x1="12" y1="19" x2="20" y2="19"/>
        </svg>
    ),
    ChevronLeft: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
        </svg>
    ),
    ChevronRight: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
        </svg>
    ),
    ChevronDown: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
        </svg>
    ),
    ChevronUp: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 15-6-6-6 6"/>
        </svg>
    ),
    LogOut: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
    ),
    Close: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
    ),
    // ── Theme icons ──────────────────────────────────────────────────────────
    Sun: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
    ),
    Moon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>
    ),
    Eye: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
            <circle cx="12" cy="12" r="3"/>
            <path d="m2 2 20 20" strokeWidth="2.5"/>
        </svg>
    ),
};

// ── Theme icon per mode ────────────────────────────────────────────────────

function ThemeIcon({ theme }: { theme: ThemeMode }) {
    if (theme === "dark") return <>{ICONS.Moon}</>;
    if (theme === "colorblind") return <>{ICONS.Eye}</>;
    return <>{ICONS.Sun}</>;
}

// ── Component ──────────────────────────────────────────────────────────────

type SidebarProps = {
    theme?: ThemeMode;
    user?: { name: string; email: string };
    collapsed?: boolean;
    onToggleCollapse?: () => void;
    mobileOpen?: boolean;
    onCloseMobile?: () => void;
    onLogout?: () => void | Promise<void>;
};

export function Sidebar({
    theme: themeProp = "light",
    user,
    collapsed = false,
    onToggleCollapse,
    mobileOpen = false,
    onCloseMobile,
    onLogout,
}: SidebarProps) {
    const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["configurator"]));
    const { startTour } = useTour();
    const { theme: contextTheme, toggleTheme } = useTheme();
    const { user: authUser } = useAuth();
    const isAdmin = authUser?.role === "admin";
    const canAccessSupportPortal = isAdmin || authUser?.role === "gerente";

    // Use context theme for toggles; prop theme for rendering (they are always in sync)
    const theme = contextTheme ?? themeProp;
    const sidebarExpanded = !collapsed || mobileOpen;

    const pathname = usePathname();
    const router = useRouter();
    const f = getFoundationByTheme(theme);
    const allGroups = navigationConfig.sidebar.groups as NavGroup[];
    const groups = allGroups
        .map((group) => ({
            ...group,
            items: group.items
                .filter((item) => isAdmin || !ADMIN_ONLY_NAV_IDS.has(item.id))
                .map((item) => ({
                    ...item,
                    children: item.children.filter(
                        (child) => canAccessSupportPortal || !MANAGER_ONLY_CHILD_NAV_IDS.has(child.id),
                    ),
                })),
        }))
        .filter((group) => group.items.length > 0);

    const isDark = theme === "dark";
    const primary = f.colors.brand.primary;
    const muted = f.colors.text.muted;
    const border = f.colors.border.default;

    const isItemActive = (item: NavItem) => {
        const selfActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const childActive = item.children?.some((c) => pathname.startsWith(c.href)) ?? false;
        return selfActive || childActive;
    };

    const isChildActive = (href: string) => pathname.startsWith(href);

    const toggleGroup = (id: string) => {
        setOpenGroups((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const hasChildren = (item: NavItem) => item.children && item.children.length > 0;

    const navigate = (href: string) => {
        router.push(href);
        onCloseMobile?.();
    };

    const handleLogout = async () => {
        onCloseMobile?.();
        await onLogout?.();
        router.push("/login");
    };

    const footerBtnBase: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "0.8rem",
        width: "100%",
        background: "none",
        border: "none",
        borderRadius: "0.8rem",
        cursor: "pointer",
        color: muted,
        fontSize: "1.3rem",
        fontFamily: "inherit",
        textAlign: "left",
        transition: "background-color 0.15s ease",
    };

    const sidebarClass = [
        styles.sidebar,
        sidebarExpanded ? styles.expanded : styles.collapsed,
        mobileOpen ? styles.mobileOpen : "",
    ].filter(Boolean).join(" ");

    return (
        <aside
            className={sidebarClass}
            style={{
                backgroundColor: isDark ? f.colors.bg.surface : "#FFFFFF",
                borderRightColor: border,
                borderRightWidth: "1px",
                borderRightStyle: "solid",
            }}
            aria-label="Navegação principal"
        >

            {/* ── Logo header ── */}
            <div className={styles.header} style={{ borderBottomColor: border }}>
                <button
                    className={`${styles.logoArea} ${styles.logoToggleBtn}`}
                    onClick={() => onToggleCollapse?.()}
                    aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
                    title={collapsed ? "Expandir menu" : "Recolher menu"}
                >
                    <img src="/assets/icone_finlumia.svg" alt="" width={26} height={26} aria-hidden="true" />
                    <span className={styles.logoText} style={{ color: primary }}>FINLUMIA</span>
                </button>
            </div>

            {/* ── Navigation ── */}
            <nav className={styles.nav}>
                {groups.map((group) => (
                    <div key={group.id} className={styles.group}>
                        {group.label && sidebarExpanded && (
                            <div className={styles.groupLabel} style={{ color: muted }}>{group.label}</div>
                        )}

                        {group.items.map((item) => {
                            const active = isItemActive(item);
                            const isOpen = openGroups.has(item.id);
                            const withChildren = hasChildren(item);

                            return (
                                <div key={item.id}>
                                    <button
                                        className={`${styles.navItem} ${active ? styles.active : ""}`}
                                        style={{ color: active ? primary : f.colors.text.secondary }}
                                        data-tour={`nav-${item.id}`}
                                        onClick={() => {
                                            if (withChildren) {
                                                if (sidebarExpanded) {
                                                    toggleGroup(item.id);
                                                } else {
                                                    onToggleCollapse?.();
                                                    setOpenGroups((prev) => new Set([...prev, item.id]));
                                                }
                                            } else {
                                                navigate(item.href);
                                            }
                                        }}
                                        aria-current={active && !withChildren ? "page" : undefined}
                                        aria-expanded={withChildren ? isOpen : undefined}
                                        title={!sidebarExpanded ? item.label : undefined}
                                    >
                                        <span className={styles.navIcon}>{ICONS[item.icon]}</span>
                                        <span className={styles.navLabel}>{item.label}</span>
                                        {item.badge && sidebarExpanded && (
                                            <span className={styles.badge} style={{ backgroundColor: f.colors.feedback.infoBg, color: f.colors.feedback.info }}>
                                                {item.badge}
                                            </span>
                                        )}
                                        {withChildren && sidebarExpanded && (
                                            <span style={{ marginLeft: "auto", flexShrink: 0, color: muted, display: "flex" }}>
                                                {isOpen ? ICONS.ChevronUp : ICONS.ChevronDown}
                                            </span>
                                        )}
                                    </button>

                                    {withChildren && sidebarExpanded && (
                                        <div style={{
                                            overflow: "hidden",
                                            maxHeight: isOpen ? `${item.children.length * 4}rem` : "0",
                                            transition: "max-height 0.25s cubic-bezier(0.4,0,0.2,1)",
                                        }}>
                                            <div style={{
                                                marginLeft: "1.6rem",
                                                borderLeft: `1px solid ${border}`,
                                                paddingBottom: "0.4rem",
                                            }}>
                                                {item.children.map((child) => {
                                                    const childActive = isChildActive(child.href);
                                                    return (
                                                        <button
                                                            key={child.id}
                                                            className={`${styles.navItem} ${childActive ? styles.active : ""}`}
                                                            style={{
                                                                color: childActive ? primary : f.colors.text.secondary,
                                                                paddingLeft: "1.2rem",
                                                                fontSize: "1.3rem",
                                                                height: "3.6rem",
                                                            }}
                                                            onClick={() => navigate(child.href)}
                                                            aria-current={childActive ? "page" : undefined}
                                                        >
                                                            <span className={styles.navIcon} style={{ width: "1.6rem", height: "1.6rem" }}>
                                                                {ICONS[child.icon]}
                                                            </span>
                                                            <span className={styles.navLabel}>{child.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* ── Footer ── */}
            {user && (
                <div className={styles.footer} style={{ borderTopColor: border }}>

                    {/* Tutorial button */}
                    <button
                        type="button"
                        onClick={startTour}
                        title="Rever tutorial"
                        aria-label="Rever tutorial"
                        style={{
                            ...footerBtnBase,
                            padding: sidebarExpanded ? "0.7rem 1rem" : "0.7rem",
                            marginBottom: "0.4rem",
                            justifyContent: sidebarExpanded ? "flex-start" : "center",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                    >
                        <span style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: "1.8rem", height: "1.8rem", borderRadius: "50%",
                            border: `1.5px solid ${muted}`, flexShrink: 0,
                            fontSize: "1.1rem", fontWeight: 700,
                        }}>?</span>
                        {sidebarExpanded && <span>Rever tutorial</span>}
                    </button>

                    {/* Theme cycle button */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        title={`${THEME_META[theme].label} — clique para ${THEME_META[theme].next}`}
                        aria-label={`Alterar tema: ${THEME_META[theme].label}`}
                        style={{
                            ...footerBtnBase,
                            padding: sidebarExpanded ? "0.7rem 1rem" : "0.7rem",
                            marginBottom: "0.4rem",
                            justifyContent: sidebarExpanded ? "flex-start" : "center",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                    >
                        {/* Pill indicator showing current theme */}
                        <span style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: "1.8rem", height: "1.8rem", borderRadius: "50%",
                            backgroundColor:
                                theme === "dark" ? "#1EC6B2" :
                                theme === "colorblind" ? "#0072B2" :
                                "#F59E0B",
                            color: "#fff", flexShrink: 0,
                        }}>
                            <ThemeIcon theme={theme} />
                        </span>
                        {sidebarExpanded && (
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {THEME_META[theme].label}
                            </span>
                        )}
                    </button>

                    {/* User area */}
                    <div className={`${styles.userArea} ${!sidebarExpanded ? styles.userAreaCollapsed : ""}`}>
                        <div className={styles.avatar} style={{ backgroundColor: primary, color: "#fff" }}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.userInfo}>
                            <div className={styles.userName} style={{ color: f.colors.text.primary }}>{user.name}</div>
                            <div className={styles.userEmail} style={{ color: muted }}>{user.email}</div>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className={styles.logoutBtn}
                            aria-label="Sair da plataforma"
                            title="Sair"
                            style={{ color: f.colors.feedback.error }}
                        >
                            {ICONS.LogOut}
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
}
