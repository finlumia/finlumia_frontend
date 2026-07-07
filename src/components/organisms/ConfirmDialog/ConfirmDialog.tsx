"use client";

import React, { useState } from "react";
import { Modal } from "../Modal";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import type { ThemeMode } from "../../../shared/styles/theme.types";

type ConfirmDialogProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    message: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    theme?: ThemeMode;
};

/** Diálogo genérico de confirmação — usado antes de qualquer exclusão irreversível. */
export function ConfirmDialog({
    open, onClose, onConfirm,
    title, message,
    confirmLabel = "Excluir",
    cancelLabel = "Cancelar",
    danger = true,
    theme = "dark",
}: ConfirmDialogProps) {
    const f = getFoundationByTheme(theme);
    const [busy, setBusy] = useState(false);

    const handleConfirm = async () => {
        setBusy(true);
        try {
            await onConfirm();
            onClose();
        } finally {
            setBusy(false);
        }
    };

    const accent = danger ? f.colors.feedback.error : f.colors.brand.primary;

    const footer = (
        <>
            <button
                type="button"
                onClick={onClose}
                disabled={busy}
                style={{
                    background: "none", border: "none", color: f.colors.text.muted,
                    fontSize: "1.4rem", cursor: busy ? "default" : "pointer", fontFamily: "inherit", padding: "0 1.2rem",
                }}
            >
                {cancelLabel}
            </button>
            <button
                type="button"
                onClick={handleConfirm}
                disabled={busy}
                style={{
                    backgroundColor: accent, color: "#fff", border: "none",
                    borderRadius: "0.8rem", padding: "0 2.4rem", height: "4rem",
                    fontSize: "1.4rem", fontWeight: 600, fontFamily: "inherit",
                    cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1,
                    display: "inline-flex", alignItems: "center", gap: "0.8rem",
                }}
            >
                {busy && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                )}
                {busy ? "Excluindo..." : confirmLabel}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );

    return (
        <Modal open={open} onClose={busy ? () => {} : onClose} title={title} size="sm" theme={theme} footer={footer}>
            <div style={{
                display: "flex", gap: "1.2rem", alignItems: "flex-start",
                fontSize: "1.4rem", color: f.colors.text.secondary, lineHeight: 1.5,
            }}>
                <span style={{
                    flexShrink: 0, width: "3.6rem", height: "3.6rem", borderRadius: "50%",
                    backgroundColor: `${accent}1A`, color: accent,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 9v4M12 17h.01" />
                        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                    </svg>
                </span>
                <div>{message}</div>
            </div>
        </Modal>
    );
}
