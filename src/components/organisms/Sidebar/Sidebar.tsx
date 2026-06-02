"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Sidebar.module.css";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import type { ThemeMode } from "../../../shared/styles/theme.types";
import navigationConfig from "../../../config/navigation.json";

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
    // Configurador children
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
    // UI controls
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
};

// ── Component ──────────────────────────────────────────────────────────────

type SidebarProps = {
    theme?: ThemeMode;
    user?: { name: string; email: string };
    /** Desktop collapsed (icon-rail) state. */
    collapsed?: boolean;
    onToggleCollapse?: () => void;
    /** Mobile/tablet off-canvas drawer open state. */
    mobileOpen?: boolean;
    onCloseMobile?: () => void;
};

export function Sidebar({
    theme = "light",
    user,
    collapsed = false,
    onToggleCollapse,
    mobileOpen = false,
    onCloseMobile,
}: SidebarProps) {
    const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["configurator"]));

    // On the mobile/tablet drawer the sidebar is always shown expanded (full width).
    const sidebarExpanded = !collapsed || mobileOpen;

    const pathname = usePathname();
    const router = useRouter();
    const f = getFoundationByTheme(theme);
    const groups = navigationConfig.sidebar.groups as NavGroup[];

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

    const handleLogout = () => {
        onCloseMobile?.();
        // No session backend yet — simply return the user to the landing page.
        router.push("/");
    };

    const sidebarClass = [
        styles.sidebar,
        sidebarExpanded ? styles.expanded : styles.collapsed,
        mobileOpen ? styles.mobileOpen : "",
    ].filter(Boolean).join(" ");

    return (
        <aside className={sidebarClass} style={{
            backgroundColor: isDark ? f.colors.bg.surface : "#FFFFFF",
            borderRightColor: border,
            borderRightWidth: "1px",
            borderRightStyle: "solid",
        }} aria-label="Navegação principal">

            {/* ── Logo header ── */}
            <div className={styles.header} style={{ borderBottomColor: border }}>
                <div className={styles.logoArea}>
                    <img src="/assets/icone_finlumia.svg" alt="" width={26} height={26} aria-hidden="true" />
                    <span className={styles.logoText} style={{ color: primary }}>FINLUMIA</span>
                </div>
                {/* Desktop: collapse / expand the icon-rail */}
                <button
                    className={`${styles.toggleBtn} ${styles.desktopOnly}`}
                    onClick={() => onToggleCollapse?.()}
                    aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
                    style={{ color: muted }}
                >
                    {collapsed ? ICONS.ChevronRight : ICONS.ChevronLeft}
                </button>
                {/* Mobile/tablet: close the drawer */}
                <button
                    className={`${styles.toggleBtn} ${styles.mobileOnly}`}
                    onClick={() => onCloseMobile?.()}
                    aria-label="Fechar menu"
                    style={{ color: muted }}
                >
                    {ICONS.Close}
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
                                    {/* Parent item */}
                                    <button
                                        className={`${styles.navItem} ${active ? styles.active : ""}`}
                                        style={{ color: active ? primary : f.colors.text.secondary }}
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

                                    {/* Children (sub-menu) */}
                                    {withChildren && sidebarExpanded && (
                                        <div
                                            style={{
                                                overflow: "hidden",
                                                maxHeight: isOpen ? `${item.children.length * 4}rem` : "0",
                                                transition: "max-height 0.25s cubic-bezier(0.4,0,0.2,1)",
                                            }}
                                        >
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

            {/* ── Footer / User ── */}
            {user && (
                <div className={styles.footer} style={{ borderTopColor: border }}>
                    <div className={styles.userArea}>
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
                            style={{ color: muted }}
                        >
                            {ICONS.LogOut}
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
}
