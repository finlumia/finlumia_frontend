"use client";

import React, { useState, useMemo } from "react";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import type { ThemeMode } from "../../../shared/styles/theme.types";

// ── Types ──────────────────────────────────────────────────────────────────

export type ColumnDef<T extends Record<string, unknown>> = {
    key: string;
    label: string;
    width?: string;
    align?: "left" | "center" | "right";
    sortable?: boolean;
    render?: (row: T) => React.ReactNode;
};

export type DataTableProps<T extends Record<string, unknown>> = {
    columns: ColumnDef<T>[];
    data: T[];
    keyField: keyof T;
    theme?: ThemeMode;
    title?: string;
    subtitle?: string;
    pageSize?: number;
    searchable?: boolean;
    searchFields?: (keyof T)[];
    searchPlaceholder?: string;
    onNew?: () => void;
    newLabel?: string;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    onView?: (row: T) => void;
    extraFilters?: React.ReactNode;
    emptyMessage?: string;
    loading?: boolean;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function SortIcon({ dir }: { dir: "asc" | "desc" | null }) {
    if (!dir) return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>
        </svg>
    );
    if (dir === "asc") return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m18 15-6-6-6 6"/>
        </svg>
    );
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6"/>
        </svg>
    );
}

// ── Component ──────────────────────────────────────────────────────────────

const PAGE_SIZE_DEFAULT = 10;

export function DataTable<T extends Record<string, unknown>>({
    columns, data, keyField, theme = "dark",
    title, subtitle, pageSize = PAGE_SIZE_DEFAULT,
    searchable = true, searchFields, searchPlaceholder = "Buscar...",
    onNew, newLabel = "+ Novo registro",
    onEdit, onDelete, onView,
    extraFilters, emptyMessage = "Nenhum registro encontrado.",
    loading = false,
}: DataTableProps<T>) {
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Set<string | number>>(new Set());

    const primary = f.colors.brand.primary;
    const border  = f.colors.border.default;
    const muted   = f.colors.text.muted;
    const surface = isDark ? f.colors.bg.elevated : "#FFFFFF";
    const elevated = isDark ? f.colors.bg.surface : f.colors.bg.elevated;

    // Filter
    const filtered = useMemo(() => {
        if (!search.trim()) return data;
        const q = search.toLowerCase();
        const fields = searchFields ?? columns.map((c) => c.key as keyof T);
        return data.filter((row) =>
            fields.some((field) => String(row[field] ?? "").toLowerCase().includes(q))
        );
    }, [data, search, columns, searchFields]);

    // Sort
    const sorted = useMemo(() => {
        if (!sort) return filtered;
        return [...filtered].sort((a, b) => {
            const av = a[sort.key] ?? "";
            const bv = b[sort.key] ?? "";
            const cmp = String(av).localeCompare(String(bv), "pt-BR", { numeric: true });
            return sort.dir === "asc" ? cmp : -cmp;
        });
    }, [filtered, sort]);

    // Paginate
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

    const toggleSort = (key: string) => {
        setSort((prev) =>
            prev?.key === key
                ? prev.dir === "asc" ? { key, dir: "desc" } : null
                : { key, dir: "asc" }
        );
        setPage(1);
    };

    const toggleSelectAll = () => {
        if (selected.size === paged.length) setSelected(new Set());
        else setSelected(new Set(paged.map((r) => r[keyField] as string | number)));
    };

    const toggleRow = (id: string | number) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const thStyle: React.CSSProperties = {
        padding: "1rem 1.2rem",
        fontSize: "1.1rem",
        fontWeight: 700,
        color: muted,
        textAlign: "left",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        borderBottom: `1px solid ${border}`,
        backgroundColor: elevated,
        whiteSpace: "nowrap",
        userSelect: "none",
    };

    const tdStyle: React.CSSProperties = {
        padding: "1rem 1.2rem",
        fontSize: "1.3rem",
        color: f.colors.text.secondary,
        borderBottom: `1px solid ${border}`,
        verticalAlign: "middle",
    };

    const iconBtn = (label: string, color: string, icon: React.ReactNode, onClick: () => void) => (
        <button
            type="button"
            title={label}
            aria-label={label}
            onClick={onClick}
            style={{
                background: "none", border: "none", cursor: "pointer",
                color, padding: "0.4rem", borderRadius: "0.4rem",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                transition: "opacity 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
            {icon}
        </button>
    );

    const EditIcon = (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
    );

    const DeleteIcon = (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
        </svg>
    );

    const ViewIcon = (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
        </svg>
    );

    const hasActions = !!(onEdit || onDelete || onView);

    // Pagination numbers
    const pageNums: (number | "…")[] = [];
    const add = (n: number | "…") => { if (pageNums.at(-1) !== n) pageNums.push(n); };
    add(1);
    if (page > 3) add("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) add(i);
    if (page < totalPages - 2) add("…");
    if (totalPages > 1) add(totalPages);

    return (
        <div style={{ fontFamily: f.typography.fontFamily.base }}>
            {/* Header */}
            {(title || onNew || searchable || extraFilters) && (
                <div style={{ marginBottom: "1.6rem" }}>
                    {title && (
                        <div style={{ marginBottom: "1.2rem" }}>
                            <h2 style={{ fontSize: "2rem", fontWeight: 700, color: f.colors.text.primary }}>{title}</h2>
                            {subtitle && <p style={{ fontSize: "1.3rem", color: muted, marginTop: "0.2rem" }}>{subtitle}</p>}
                        </div>
                    )}
                    <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", alignItems: "center" }}>
                        {searchable && (
                            <div style={{ position: "relative", flex: "1 1 22rem", minWidth: "18rem" }}>
                                <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: muted, pointerEvents: "none" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                                    </svg>
                                </span>
                                <input
                                    type="search"
                                    placeholder={searchPlaceholder}
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    style={{
                                        width: "100%", height: "3.6rem", paddingLeft: "3.2rem",
                                        paddingRight: "1rem", borderRadius: "0.8rem",
                                        border: `1px solid ${border}`,
                                        backgroundColor: surface, color: f.colors.text.primary,
                                        fontSize: "1.3rem", fontFamily: "inherit", outline: "none",
                                    }}
                                />
                            </div>
                        )}
                        {extraFilters}
                        {selected.size > 0 && (
                            <span style={{ fontSize: "1.2rem", color: muted }}>{selected.size} selecionado(s)</span>
                        )}
                        {onNew && (
                            <button
                                type="button"
                                onClick={onNew}
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                                    height: "3.6rem", padding: "0 1.6rem",
                                    borderRadius: "0.8rem", border: "none",
                                    backgroundColor: primary, color: "#fff",
                                    fontSize: "1.3rem", fontWeight: 600,
                                    cursor: "pointer", fontFamily: "inherit",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {newLabel}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            <div style={{ backgroundColor: surface, border: `1px solid ${border}`, borderRadius: "1.2rem", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "60rem" }}>
                        <thead>
                            <tr>
                                <th style={{ ...thStyle, width: "3.6rem" }}>
                                    <input
                                        type="checkbox"
                                        aria-label="Selecionar todos"
                                        checked={selected.size > 0 && selected.size === paged.length}
                                        onChange={toggleSelectAll}
                                        style={{ width: "1.4rem", height: "1.4rem", accentColor: primary, cursor: "pointer" }}
                                    />
                                </th>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        style={{ ...thStyle, textAlign: col.align ?? "left", width: col.width, cursor: col.sortable ? "pointer" : "default" }}
                                        onClick={() => col.sortable && toggleSort(col.key)}
                                    >
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                                            {col.label}
                                            {col.sortable && (
                                                <span style={{ color: sort?.key === col.key ? primary : muted }}>
                                                    <SortIcon dir={sort?.key === col.key ? sort.dir : null} />
                                                </span>
                                            )}
                                        </span>
                                    </th>
                                ))}
                                {hasActions && (
                                    <th style={{ ...thStyle, textAlign: "center", width: "9rem" }}>Ações</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length + (hasActions ? 2 : 1)} style={{ ...tdStyle, textAlign: "center", padding: "4rem", border: "none" }}>
                                        <div style={{ display: "inline-block" }}>
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                                                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                            </svg>
                                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                        </div>
                                    </td>
                                </tr>
                            ) : paged.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + (hasActions ? 2 : 1)} style={{ ...tdStyle, textAlign: "center", padding: "4.8rem", color: muted, border: "none" }}>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem" }}>
                                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                            </svg>
                                            <span>{emptyMessage}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paged.map((row) => {
                                    const id = row[keyField] as string | number;
                                    const isSel = selected.has(id);
                                    return (
                                        <tr key={String(id)} style={{ backgroundColor: isSel ? `${primary}0d` : "transparent" }}>
                                            <td style={{ ...tdStyle, width: "3.6rem" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSel}
                                                    onChange={() => toggleRow(id)}
                                                    style={{ width: "1.4rem", height: "1.4rem", accentColor: primary, cursor: "pointer" }}
                                                />
                                            </td>
                                            {columns.map((col) => (
                                                <td key={col.key} style={{ ...tdStyle, textAlign: col.align ?? "left" }}>
                                                    {col.render
                                                        ? col.render(row)
                                                        : <span style={{ color: f.colors.text.primary }}>{String(row[col.key] ?? "—")}</span>
                                                    }
                                                </td>
                                            ))}
                                            {hasActions && (
                                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                                    <div style={{ display: "inline-flex", gap: "0.2rem" }}>
                                                        {onView   && iconBtn("Visualizar", muted,                    ViewIcon,   () => onView(row))}
                                                        {onEdit   && iconBtn("Editar",     f.colors.brand.primary,   EditIcon,   () => onEdit(row))}
                                                        {onDelete && iconBtn("Excluir",    f.colors.feedback.error,  DeleteIcon, () => onDelete(row))}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "1rem 1.6rem", borderTop: `1px solid ${border}`,
                    flexWrap: "wrap", gap: "0.8rem",
                }}>
                    <span style={{ fontSize: "1.2rem", color: muted }}>
                        {sorted.length === 0 ? "0 registros" : (
                            <>
                                <strong style={{ color: f.colors.text.secondary }}>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)}</strong>
                                {" "}de{" "}
                                <strong style={{ color: f.colors.text.secondary }}>{sorted.length}</strong>
                                {" "}registros
                            </>
                        )}
                    </span>
                    <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                        {[
                            { label: "‹", action: () => setPage((p) => Math.max(1, p - 1)), disabled: page === 1 },
                        ].map((btn) => (
                            <button key={btn.label} type="button" disabled={btn.disabled} onClick={btn.action}
                                style={{ minWidth: "3rem", height: "3rem", borderRadius: "0.5rem", border: `1px solid ${border}`, backgroundColor: "transparent", color: btn.disabled ? muted : f.colors.text.secondary, fontSize: "1.3rem", cursor: btn.disabled ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                                {btn.label}
                            </button>
                        ))}
                        {pageNums.map((n, i) => (
                            n === "…" ? (
                                <span key={`e${i}`} style={{ color: muted, padding: "0 0.3rem" }}>…</span>
                            ) : (
                                <button key={n} type="button" onClick={() => setPage(n)}
                                    style={{ minWidth: "3rem", height: "3rem", borderRadius: "0.5rem", border: `1px solid ${n === page ? primary : border}`, backgroundColor: n === page ? primary : "transparent", color: n === page ? "#fff" : f.colors.text.secondary, fontSize: "1.3rem", fontWeight: n === page ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                                    {n}
                                </button>
                            )
                        ))}
                        {[
                            { label: "›", action: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: page === totalPages },
                        ].map((btn) => (
                            <button key={btn.label} type="button" disabled={btn.disabled} onClick={btn.action}
                                style={{ minWidth: "3rem", height: "3rem", borderRadius: "0.5rem", border: `1px solid ${border}`, backgroundColor: "transparent", color: btn.disabled ? muted : f.colors.text.secondary, fontSize: "1.3rem", cursor: btn.disabled ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
