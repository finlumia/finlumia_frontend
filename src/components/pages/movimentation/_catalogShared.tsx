"use client";

import React, { useState } from "react";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { ConfirmDialog } from "../../organisms/ConfirmDialog";
import type { ThemeMode } from "../../../shared/styles/theme.types";

type F = ReturnType<typeof getFoundationByTheme>;

export function TypeBadge({ isDefault, f }: { isDefault: boolean; f: F }) {
    const color = isDefault ? f.colors.text.muted : f.colors.brand.primary;
    const bg = isDefault ? `${f.colors.text.muted}1A` : `${f.colors.brand.primary}1A`;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "0.2rem 0.7rem", borderRadius: "999px",
            fontSize: "1.1rem", fontWeight: 600, letterSpacing: "0.03em",
            color, backgroundColor: bg, border: `1px solid ${color}40`,
        }}>
            {isDefault ? "Padrão" : "Personalizada"}
        </span>
    );
}

export function DeleteAction({
    isDefault, f, onDelete, label, itemName, theme = "dark",
}: { isDefault: boolean; f: F; onDelete: () => void; label: string; itemName: string; theme?: ThemeMode }) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    if (isDefault) {
        return <span style={{ fontSize: "1.1rem", color: f.colors.text.muted }} title="Itens padrão não podem ser removidos">—</span>;
    }
    return (
        <>
            <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                aria-label={label}
                title="Excluir"
                style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: f.colors.feedback.error, padding: "0.4rem", borderRadius: "0.4rem",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                </svg>
            </button>
            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={onDelete}
                title="Excluir item"
                message={<>Tem certeza que deseja excluir <strong>{itemName}</strong>? Essa ação não pode ser desfeita.</>}
                theme={theme}
            />
        </>
    );
}
