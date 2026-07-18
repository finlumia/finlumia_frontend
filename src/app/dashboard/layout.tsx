"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "../../components/organisms/Sidebar";
import { BottomNav } from "../../components/organisms/BottomNav";
import { useTheme } from "../../shared/styles/theme.context";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { FinanceProvider } from "../../shared/finance/finance.context";
import { useAuth } from "../../contexts/auth.context";
import { TourProvider } from "../../contexts/tour.context";
import { TourOverlay } from "../../components/organisms/Tour/TourOverlay";
import styles from "./dashboard.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    // Tie drawer open state to the current route so navigation closes it without an effect.
    const [drawer, setDrawer] = useState({ forPath: "", open: false });
    const mobileOpen = drawer.forPath === pathname && drawer.open;
    const setMobileOpen = useCallback(
        (open: boolean) => setDrawer({ forPath: pathname, open }),
        [pathname],
    );

    // Prevent background scroll while the drawer is open on small screens.
    useEffect(() => {
        if (typeof document === "undefined") return;
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    const sidebarUser = user
        ? { name: user.name, email: user.email }
        : { name: "", email: "" };

    const sidebarWidth = collapsed ? "6.4rem" : "24rem";
    const showNewTransaction = pathname !== "/dashboard/movimentation/transactions";

    if (isLoading || !isAuthenticated) {
        return (
            <div style={{
                minHeight: "100vh",
                backgroundColor: f.colors.bg.app,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <div style={{
                    width: "3.2rem",
                    height: "3.2rem",
                    borderRadius: "50%",
                    border: `3px solid ${f.colors.border.default}`,
                    borderTopColor: f.colors.brand.primary,
                    animation: "spin 0.8s linear infinite",
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <TourProvider>
        <FinanceProvider>
        <div
            className={styles.shell}
            data-app-theme={theme}
            style={{
                backgroundColor: f.colors.bg.app,
                ["--sidebar-width" as string]: sidebarWidth,
            } as React.CSSProperties}
        >
            <Sidebar
                theme={theme}
                user={sidebarUser}
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed((v) => !v)}
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
                onLogout={logout}
            />

            {/* Backdrop for the off-canvas drawer (mobile / tablet only) */}
            <div
                className={`${styles.backdrop} ${mobileOpen ? styles.open : ""}`}
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
            />

            <main className={styles.main}>
                {/* Topbar — visible on mobile / tablet only (controlled via CSS) */}
                <header
                    className={styles.topbar}
                    style={{
                        backgroundColor: isDark ? `${f.colors.bg.surface}E6` : "rgba(255,255,255,0.85)",
                        borderBottomColor: f.colors.border.default,
                    }}
                >
                    <button
                        type="button"
                        className={styles.menuButton}
                        onClick={() => setMobileOpen(true)}
                        aria-label="Abrir menu"
                        aria-expanded={mobileOpen}
                        style={{ color: f.colors.text.secondary }}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                    <div className={styles.topbarLogo}>
                        <img src="/assets/icone_finlumia.svg" alt="" width={24} height={24} aria-hidden="true" />
                        <span className={styles.topbarLogoText} style={{ color: f.colors.brand.primary }}>
                            FINLUMIA
                        </span>
                    </div>
                </header>

                <div className={styles.mainInner}>
                    {children}
                </div>
            </main>

            {/* Atalho global: cadastro de transação exige vários cliques (Movimentações
                > Transações > Nova movimentação) — o FAB abre o formulário de qualquer
                tela do dashboard. Some na própria página de transações, que já tem o
                botão "+ Nova movimentação" no cabeçalho. Em telas de celular esse
                atalho vive dentro do BottomNav (botão central), então o FAB solto
                fica oculto ali via CSS — ver dashboard.module.css. */}
            {showNewTransaction && (
                <button
                    type="button"
                    onClick={() => router.push("/dashboard/movimentation/transactions?new=1")}
                    aria-label="Nova movimentação"
                    title="Nova movimentação"
                    className={styles.fab}
                    style={{ backgroundColor: f.colors.brand.primary, color: "#fff" }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                </button>
            )}

            <BottomNav theme={theme} />
        </div>
            <TourOverlay />
        </FinanceProvider>
        </TourProvider>
    );
}
