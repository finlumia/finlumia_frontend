"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "../../components/organisms/Sidebar";
import { useTheme } from "../../shared/styles/theme.context";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { FinanceProvider } from "../../shared/finance/finance.context";
import styles from "./dashboard.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const pathname = usePathname();

    // Close the mobile drawer whenever the route changes.
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Prevent background scroll while the drawer is open on small screens.
    useEffect(() => {
        if (typeof document === "undefined") return;
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    const mockUser = { name: "Thiago Benevide", email: "thiago@finlumia.com" };

    const sidebarWidth = collapsed ? "6.4rem" : "24rem";

    return (
        <FinanceProvider>
        <div
            className={styles.shell}
            style={{
                backgroundColor: f.colors.bg.app,
                ["--sidebar-width" as string]: sidebarWidth,
            } as React.CSSProperties}
        >
            <Sidebar
                theme={theme}
                user={mockUser}
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed((v) => !v)}
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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
        </div>
        </FinanceProvider>
    );
}
