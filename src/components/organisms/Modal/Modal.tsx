"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import type { ThemeMode } from "../../../shared/styles/theme.types";

type ModalSize = "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<ModalSize, string> = {
    sm: "42rem",
    md: "52rem",
    lg: "64rem",
    xl: "80rem",
};

type ModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    size?: ModalSize;
    theme?: ThemeMode;
    footer?: React.ReactNode;
    children: React.ReactNode;
};

export function Modal({
    open,
    onClose,
    title,
    subtitle,
    size = "md",
    theme = "dark",
    footer,
    children,
}: ModalProps) {
    const f = getFoundationByTheme(theme);
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on ESC
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    // Lock body scroll
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    const panel = (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
            <div
                ref={panelRef}
                className={styles.panel}
                style={{
                    maxWidth: SIZE_MAP[size],
                    backgroundColor: theme === "dark" ? f.colors.bg.elevated : f.colors.bg.surface,
                    border: `1px solid ${f.colors.border.default}`,
                    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
                }}
            >
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerText}>
                        {subtitle && (
                            <span style={{
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                letterSpacing: "0.07em",
                                textTransform: "uppercase",
                                color: f.colors.brand.primary,
                                fontFamily: f.typography.fontFamily.base,
                            }}>
                                {subtitle}
                            </span>
                        )}
                        <h2
                            id="modal-title"
                            style={{
                                fontSize: "2rem",
                                fontWeight: 700,
                                color: f.colors.text.primary,
                                fontFamily: f.typography.fontFamily.heading,
                                margin: 0,
                            }}
                        >
                            {title}
                        </h2>
                    </div>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Fechar"
                        style={{ color: f.colors.text.muted }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className={styles.body} style={{ fontFamily: f.typography.fontFamily.base }}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div
                        className={styles.footer}
                        style={{ borderTopColor: f.colors.border.default }}
                    >
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );

    return typeof document !== "undefined"
        ? createPortal(panel, document.body)
        : null;
}
