"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import type { ThemeMode } from "../../shared/styles/theme.types";
import { useTheme } from "../../shared/styles/theme.context";
import { useAuth } from "../../contexts/auth.context";
import { useTour } from "../../contexts/tour.context";
import navigationConfig from "../../config/navigation.json";

// Página "Mais" — só é alcançável pela aba equivalente do BottomNav (celular).
// Existe porque o drawer off-canvas da Sidebar (usado em tablet/desktop) tem
// altura fixa (100vh) e ficava com o rodapé — inclusive o botão de sair —
// escondido atrás da barra de endereço/navegação de navegadores mobile, que
// reserva espaço variável de viewport. Como página normal, o conteúdo rola
// junto com o documento e nunca fica inacessível.
const ADMIN_ONLY_NAV_IDS = new Set(["configurator"]);

type NavItem = {
    id: string;
    label: string;
    icon: string;
    href: string;
    exact: boolean;
    badge?: string | null;
};

type NavGroup = {
    id: string;
    label: string | null;
    items: NavItem[];
};

const THEME_META: Record<ThemeMode, { label: string; next: string }> = {
    light:      { label: "Modo claro",       next: "Modo escuro" },
    dark:       { label: "Modo escuro",      next: "Daltonismo" },
    colorblind: { label: "Daltonismo (CUD)", next: "Modo claro" },
};

const ICONS: Record<string, React.ReactNode> = {
    LayoutDashboard: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
    ),
    Settings2: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7h-9"/><path d="M14 17H5"/>
            <circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>
        </svg>
    ),
    ArrowLeftRight: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3 4 7l4 4"/><path d="M4 7h16"/>
            <path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>
        </svg>
    ),
    BarChart3: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
        </svg>
    ),
    LifeBuoy: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
            <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/>
            <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/>
            <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/>
            <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/>
        </svg>
    ),
    BookOpen: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4h7a2 2 0 0 1 2 2v14H4a2 2 0 0 1-2-2Z"/><path d="M22 4h-7a2 2 0 0 0-2 2v14h7a2 2 0 0 0 2-2Z"/>
        </svg>
    ),
    ChevronRight: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
        </svg>
    ),
    LogOut: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
    ),
    HelpCircle: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
    ),
    Sun: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
    ),
    Moon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>
    ),
    Eye: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
            <circle cx="12" cy="12" r="3"/>
            <path d="m2 2 20 20" strokeWidth="2.5"/>
        </svg>
    ),
};

function ThemeIcon({ theme }: { theme: ThemeMode }) {
    if (theme === "dark") return <>{ICONS.Moon}</>;
    if (theme === "colorblind") return <>{ICONS.Eye}</>;
    return <>{ICONS.Sun}</>;
}

export function MorePage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const { startTour } = useTour();
    const isAdmin = user?.role === "admin";
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const groups = (navigationConfig.sidebar.groups as NavGroup[])
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => isAdmin || !ADMIN_ONLY_NAV_IDS.has(item.id)),
        }))
        .filter((group) => group.items.length > 0);

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    const cardStyle: React.CSSProperties = {
        backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
        border: `1px solid ${f.colors.border.default}`,
        borderRadius: "1.2rem",
        overflow: "hidden",
    };

    const rowStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "1.2rem",
        width: "100%",
        padding: "1.4rem 1.6rem",
        background: "none",
        border: "none",
        borderBottom: `1px solid ${f.colors.border.default}`,
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        fontSize: "1.4rem",
        color: f.colors.text.primary,
    };

    const lastRowStyle: React.CSSProperties = { ...rowStyle, borderBottom: "none" };

    const rowIconStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "2rem",
        height: "2rem",
        flexShrink: 0,
        color: f.colors.text.muted,
    };

    return (
        <div className="page-responsive" style={{ maxWidth: "76rem" }}>
            {/* Perfil */}
            <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "1.2rem", padding: "1.6rem", marginBottom: "2rem" }}>
                <div style={{
                    width: "4.8rem", height: "4.8rem", borderRadius: "50%",
                    backgroundColor: f.colors.brand.primary, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.8rem", fontWeight: 700, flexShrink: 0,
                }}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: "1.6rem", fontWeight: 700, color: f.colors.text.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user?.name}
                    </div>
                    <div style={{ fontSize: "1.3rem", color: f.colors.text.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user?.email}
                    </div>
                </div>
            </div>

            {/* Navegação completa */}
            {groups.map((group) => (
                <div key={group.id} style={{ marginBottom: "2rem" }}>
                    {group.label && (
                        <div style={{
                            fontSize: "1.1rem", fontWeight: 600, letterSpacing: "0.08em",
                            textTransform: "uppercase", color: f.colors.text.muted,
                            padding: "0 0.4rem 0.8rem",
                        }}>
                            {group.label}
                        </div>
                    )}
                    <div style={cardStyle}>
                        {group.items.map((item, i) => (
                            <button
                                key={item.id}
                                type="button"
                                style={i === group.items.length - 1 ? lastRowStyle : rowStyle}
                                onClick={() => router.push(item.href)}
                            >
                                <span style={rowIconStyle}>{ICONS[item.icon]}</span>
                                <span style={{ flex: 1 }}>{item.label}</span>
                                {item.badge && (
                                    <span style={{
                                        fontSize: "1.0rem", fontWeight: 600, padding: "0.15rem 0.5rem",
                                        borderRadius: "999px", backgroundColor: f.colors.feedback.infoBg, color: f.colors.feedback.info,
                                    }}>
                                        {item.badge}
                                    </span>
                                )}
                                <span style={{ ...rowIconStyle, width: "1.6rem" }}>{ICONS.ChevronRight}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            {/* Preferências e conta */}
            <div style={{ marginBottom: "2rem" }}>
                <div style={{
                    fontSize: "1.1rem", fontWeight: 600, letterSpacing: "0.08em",
                    textTransform: "uppercase", color: f.colors.text.muted,
                    padding: "0 0.4rem 0.8rem",
                }}>
                    Conta
                </div>
                <div style={cardStyle}>
                    <button type="button" style={rowStyle} onClick={startTour}>
                        <span style={rowIconStyle}>{ICONS.HelpCircle}</span>
                        <span style={{ flex: 1 }}>Rever tutorial</span>
                        <span style={{ ...rowIconStyle, width: "1.6rem" }}>{ICONS.ChevronRight}</span>
                    </button>
                    <button type="button" style={rowStyle} onClick={toggleTheme}>
                        <span style={rowIconStyle}><ThemeIcon theme={theme} /></span>
                        <span style={{ flex: 1 }}>{THEME_META[theme].label}</span>
                        <span style={{ fontSize: "1.2rem", color: f.colors.text.muted }}>{THEME_META[theme].next}</span>
                    </button>
                    <button
                        type="button"
                        style={{ ...lastRowStyle, color: f.colors.feedback.error }}
                        onClick={handleLogout}
                    >
                        <span style={{ ...rowIconStyle, color: f.colors.feedback.error }}>{ICONS.LogOut}</span>
                        <span style={{ flex: 1, fontWeight: 600 }}>Sair da plataforma</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
