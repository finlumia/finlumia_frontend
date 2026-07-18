"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NewTransactionModal } from "../organisms/NewTransactionModal";
import { ImportModal } from "../organisms/ImportModal";
import { ConfirmDialog } from "../organisms/ConfirmDialog";
import { TransactionFeedback, type FeedbackKind } from "../organisms/TransactionFeedback";
import { ConfettiBurst } from "../organisms/ConfettiBurst";
import { Button } from "../atoms/button";
import {
    type Transaction, type TransactionType,
    type PaymentMethod, type InstitutionId, type CategoryId,
} from "../../config/transactions";
import { useFinance, type Category } from "../../shared/finance/finance.context";
import { resolveCategoryColor } from "../../config/categoryPalette";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { useTheme } from "../../shared/styles/theme.context";
import type { ThemeMode } from "../../shared/styles/theme.types";
import { transactionsService } from "../../services/movimentation/movement.service";
import type { TransactionCreateRequest } from "../../api/types";

const PAGE_SIZE = 10;

type Filter = {
    type: TransactionType | "all";
    category: string | "all";
    search: string;
};

function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
    const [year, month, day] = iso.split("-");
    return `${day} ${["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][parseInt(month) - 1]}, ${year}`;
}

function CategoryBadge({ cat, f, theme }: { cat?: Category; f: ReturnType<typeof getFoundationByTheme>; theme: ThemeMode }) {
    if (!cat) return <span style={{ color: f.colors.text.muted }}>—</span>;
    const { fg, bg, border } = resolveCategoryColor(cat.id, theme, cat.color);
    return (
        <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "0.25rem 0.75rem", borderRadius: "999px",
            fontSize: "1.1rem", fontWeight: 600, letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: fg,
            backgroundColor: bg,
            border: `1px solid ${border}`,
        }}>
            {cat.label}
        </span>
    );
}

function TypeBadge({ type, f }: { type: TransactionType; f: ReturnType<typeof getFoundationByTheme> }) {
    const isIncome = type === "receita";
    const color = isIncome ? f.colors.feedback.success : f.colors.feedback.error;
    const bg = isIncome ? f.colors.feedback.successBg : f.colors.feedback.errorBg;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "0.25rem 0.75rem", borderRadius: "999px",
            fontSize: "1.1rem", fontWeight: 600, letterSpacing: "0.04em",
            textTransform: "uppercase",
            color, backgroundColor: bg,
            border: `1px solid ${color}40`,
        }}>
            {isIncome ? "Receita" : "Despesa"}
        </span>
    );
}

export function MovimentationPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const {
        transactions,
        appendTransaction,
        updateTransaction,
        removeTransaction,
        refreshTransactions,
        isLoadingTransactions,
        transactionsError,
        categories, paymentMethods, categoryById, bankById,
        loadData,
    } = useFinance();

    useEffect(() => { loadData(); }, [loadData]);

    const router = useRouter();
    const searchParams = useSearchParams();

    const [showNew, setShowNew] = useState(false);

    // Atalho global (FAB/painel inicial): "?new=1" abre o modal de lançamento
    // direto, sem exigir navegar manualmente até Movimentações > Transações.
    useEffect(() => {
        if (searchParams.get("new") === "1") {
            setShowNew(true);
            router.replace("/dashboard/movimentation/transactions");
        }
    }, [searchParams, router]);
    const [showImport, setShowImport] = useState(false);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState<Filter>({ type: "all", category: "all", search: "" });
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [apiError, setApiError] = useState("");
    const [confirmDelete, setConfirmDelete] = useState<Transaction | null>(null);
    const [feedback, setFeedback] = useState<{ kind: FeedbackKind; description: string } | null>(null);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [confettiTrigger, setConfettiTrigger] = useState(0);
    const [confettiColors, setConfettiColors] = useState<string[]>([]);

    const filtered = useMemo(() => {
        return transactions.filter((t) => {
            if (filter.type !== "all" && t.type !== filter.type) return false;
            if (filter.category !== "all" && t.category !== filter.category) return false;
            if (filter.search) {
                const q = filter.search.toLowerCase();
                return t.description.toLowerCase().includes(q) || t.subDescription?.toLowerCase().includes(q);
            }
            return true;
        });
    }, [transactions, filter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSave = async (tx: Omit<Transaction, "id">) => {
        setApiError("");
        const req: TransactionCreateRequest = {
            type: tx.type,
            method: tx.method as PaymentMethod,
            institution: tx.institution as InstitutionId,
            date: tx.date,
            category: tx.category as CategoryId,
            description: tx.description,
            subDescription: tx.subDescription,
            amount: tx.amount,
            notes: tx.notes,
            // Backend exige o campo (@NotNull) e usa o valor para decidir se
            // preserva (true) ou desvincula (false) o lançamento da série.
            isRecurring: tx.isRecurring ?? false,
        };
        if (editingTx) {
            try {
                const updated = await transactionsService.update(editingTx.id, req);
                updateTransaction(editingTx.id, updated as unknown as Transaction);
                setEditingTx(null);
            } catch (err) {
                const status = (err as { status?: number }).status;
                // Lançamento pode ter sido excluído/alterado em outra sessão desde que a
                // lista foi carregada — sem isso, o usuário ficava preso tentando salvar
                // um id que o backend não reconhece mais, sempre recebendo o mesmo 404.
                if (status === 404) {
                    removeTransaction(editingTx.id);
                    setEditingTx(null);
                    setApiError("Este lançamento não foi encontrado — pode ter sido removido. A lista foi atualizada.");
                    refreshTransactions();
                    return;
                }
                // 410: o id existiu mas a série inteira foi apagada em cascata (delete
                // "a partir daqui"/"todas") a partir de outra instância — distinto do
                // 404 genérico, então a lista precisa ser revalidada por completo, não
                // só o item clicado.
                if (status === 410) {
                    removeTransaction(editingTx.id);
                    setEditingTx(null);
                    setApiError("Este lançamento fazia parte de uma série recorrente que foi removida.");
                    refreshTransactions();
                    return;
                }
                throw err;
            }
            return;
        }

        const created = await transactionsService.create(req);
        (created as unknown as Transaction[]).forEach((t) => appendTransaction(t));
        const kind: FeedbackKind = tx.category === "investimento" ? "investimento" : tx.type;
        setFeedback({ kind, description: tx.description });

        // Confete só para lançamentos que são uma boa notícia (receita/investimento) —
        // despesa continua só com a notificação padrão, sem comemoração.
        if (kind !== "despesa") {
            setConfettiColors(
                kind === "investimento"
                    ? [f.colors.brand.primary, f.colors.brand.accent, resolveCategoryColor("investimento", theme).fg, f.colors.brand.secondary]
                    : [f.colors.brand.primary, f.colors.brand.accent, f.colors.feedback.success, f.colors.brand.secondary],
            );
            setConfettiTrigger((n) => n + 1);
        }
    };

    const handleEdit = (tx: Transaction) => {
        setEditingTx(tx);
        setShowNew(true);
    };

    const handleDelete = async (id: string) => {
        setApiError("");
        try {
            await transactionsService.delete(id);
            removeTransaction(id);
            setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
        } catch (err: unknown) {
            const status = (err as { status?: number })?.status;
            // 404 aqui significa que o lançamento já não existe no backend — remove
            // localmente também para não deixar uma linha "fantasma" na tabela.
            if (status === 404) {
                removeTransaction(id);
                setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
                setApiError("Este lançamento já havia sido removido. A lista foi atualizada.");
                return;
            }
            // 410: a série desse lançamento foi apagada em cascata por outra ação
            // (delete "a partir daqui"/"todas") — outras instâncias da mesma série
            // também podem estar obsoletas na lista, então revalida tudo.
            if (status === 410) {
                removeTransaction(id);
                setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
                setApiError("Este lançamento fazia parte de uma série recorrente que foi removida. A lista foi atualizada.");
                refreshTransactions();
                return;
            }
            setApiError((err as { message?: string })?.message ?? "Erro ao excluir transação.");
        }
    };

    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            const s = new Set(prev);
            if (s.has(id)) s.delete(id);
            else s.add(id);
            return s;
        });
    };

    const selectAll = () => {
        if (selected.size === paged.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(paged.map((t) => t.id)));
        }
    };

    const primary = f.colors.brand.primary;
    const border = f.colors.border.default;
    const muted = f.colors.text.muted;
    const surface = isDark ? f.colors.bg.surface : "#FFFFFF";
    const elevated = isDark ? f.colors.bg.elevated : f.colors.bg.app;

    const thCellStyle: React.CSSProperties = {
        padding: "1rem 1.2rem",
        fontSize: "1.2rem",
        fontWeight: 600,
        color: muted,
        textAlign: "left",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        borderBottom: `1px solid ${border}`,
        whiteSpace: "nowrap",
    };

    const tdCellStyle: React.CSSProperties = {
        padding: "1.2rem 1.2rem",
        fontSize: "1.3rem",
        color: f.colors.text.secondary,
        borderBottom: `1px solid ${border}`,
        verticalAlign: "middle",
    };

    const paginationBtn = (label: string | number, active: boolean, onClick: () => void, disabled = false): React.ReactNode => (
        <button
            key={label}
            type="button"
            onClick={onClick}
            disabled={disabled}
            style={{
                minWidth: "3.2rem", height: "3.2rem",
                borderRadius: "0.6rem",
                border: `1px solid ${active ? primary : border}`,
                backgroundColor: active ? primary : "transparent",
                color: active ? "#fff" : disabled ? muted : f.colors.text.secondary,
                fontSize: "1.3rem", fontWeight: active ? 700 : 400,
                cursor: disabled ? "not-allowed" : "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s ease",
                fontFamily: f.typography.fontFamily.base,
            }}
        >
            {label}
        </button>
    );

    const renderPagination = () => {
        const pages: React.ReactNode[] = [];
        pages.push(paginationBtn("‹", false, () => setPage((p) => Math.max(1, p - 1)), page === 1));

        const range = new Set<number>();
        range.add(1);
        range.add(totalPages);
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) range.add(i);

        let prev = 0;
        for (const p of [...range].sort((a, b) => a - b)) {
            if (prev && p - prev > 1) {
                pages.push(<span key={`e-${p}`} style={{ color: muted, padding: "0 0.4rem" }}>...</span>);
            }
            pages.push(paginationBtn(p, p === page, () => setPage(p)));
            prev = p;
        }

        pages.push(paginationBtn("›", false, () => setPage((p) => Math.min(totalPages, p + 1)), page === totalPages));
        return pages;
    };

    const showCount = filtered.length > 0
        ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)}`
        : "0";

    return (
        <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, maxWidth: "140rem" }}>

            {/* Page header */}
            <div style={{ marginBottom: "0.4rem" }}>
                <p style={{ fontSize: "1.2rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: muted, marginBottom: "0.4rem" }}>
                    Finanças &amp; Fluxo
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.2rem" }}>
                    <h1 style={{ fontSize: "2.8rem", fontWeight: 700, color: f.colors.text.primary }}>
                        Movimentações
                    </h1>
                    <div style={{ display: "flex", gap: "0.8rem" }}>
                        <span title="Em breve">
                            <Button
                                label="Importar extrato"
                                type="button"
                                theme={theme}
                                variant="outlined"
                                size="md"
                                disabled
                                onClick={() => {}}
                                styleConfig={{
                                    backgroudColor: "transparent",
                                    textColor: f.colors.text.secondary,
                                    border: `1px solid ${border}`,
                                    borderRadius: "0.8rem",
                                    padding: "0 1.6rem",
                                }}
                            />
                        </span>
                        <Button
                            label="+ Nova movimentação"
                            type="button"
                            theme={theme}
                            variant="primary"
                            size="md"
                            onClick={() => setShowNew(true)}
                            styleConfig={{
                                backgroudColor: primary,
                                textColor: "#fff",
                                border: "none",
                                borderRadius: "0.8rem",
                                padding: "0 1.6rem",
                                fontWeight: "600",
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Error banner */}
            {(apiError || transactionsError) && (
                <div style={{
                    marginTop: "1.2rem", padding: "1rem 1.4rem", borderRadius: "0.8rem",
                    backgroundColor: isDark ? f.colors.feedback.errorBg : "#FEF2F2",
                    border: `1px solid ${f.colors.feedback.error}`,
                    color: f.colors.feedback.error, fontSize: "1.3rem",
                }}>
                    {apiError || transactionsError}
                </div>
            )}

            {/* Filters bar */}
            <div style={{
                display: "flex", gap: "1rem", marginBottom: "2rem", marginTop: "1.6rem",
                flexWrap: "wrap", alignItems: "center",
            }}>
                {/* Search */}
                <div style={{ position: "relative", flex: "1 1 24rem", minWidth: "20rem" }}>
                    <span style={{ position: "absolute", left: "1.2rem", top: "50%", transform: "translateY(-50%)", color: muted, pointerEvents: "none" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                    </span>
                    <input
                        type="search"
                        placeholder="Buscar por descrição..."
                        value={filter.search}
                        onChange={(e) => { setFilter((p) => ({ ...p, search: e.target.value })); setPage(1); }}
                        style={{
                            width: "100%", height: "3.8rem", paddingLeft: "3.6rem", paddingRight: "1.2rem",
                            borderRadius: "0.8rem", border: `1px solid ${border}`,
                            backgroundColor: surface, color: f.colors.text.primary,
                            fontSize: "1.3rem", fontFamily: "inherit", outline: "none",
                        }}
                    />
                </div>

                {/* Type filter */}
                <select
                    value={filter.type}
                    onChange={(e) => { setFilter((p) => ({ ...p, type: e.target.value as Filter["type"] })); setPage(1); }}
                    style={{
                        height: "3.8rem", padding: "0 1.2rem", borderRadius: "0.8rem",
                        border: `1px solid ${border}`, backgroundColor: surface,
                        color: f.colors.text.primary, fontSize: "1.3rem",
                        fontFamily: "inherit", cursor: "pointer", outline: "none",
                    }}
                >
                    <option value="all">Todos os tipos</option>
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                </select>

                {/* Category filter */}
                <select
                    value={filter.category}
                    onChange={(e) => { setFilter((p) => ({ ...p, category: e.target.value as Filter["category"] })); setPage(1); }}
                    style={{
                        height: "3.8rem", padding: "0 1.2rem", borderRadius: "0.8rem",
                        border: `1px solid ${border}`, backgroundColor: surface,
                        color: f.colors.text.primary, fontSize: "1.3rem",
                        fontFamily: "inherit", cursor: "pointer", outline: "none",
                    }}
                >
                    <option value="all">Todas as categorias</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
            </div>

            {/* Table card */}
            <div style={{
                backgroundColor: surface,
                border: `1px solid ${border}`,
                borderRadius: "1.2rem",
                overflow: "hidden",
            }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "72rem" }}>
                        <thead style={{ backgroundColor: elevated }}>
                            <tr>
                                <th style={{ ...thCellStyle, width: "4rem" }}>
                                    <input
                                        type="checkbox"
                                        aria-label="Selecionar todos"
                                        checked={selected.size > 0 && selected.size === paged.length}
                                        onChange={selectAll}
                                        style={{ width: "1.5rem", height: "1.5rem", accentColor: primary, cursor: "pointer" }}
                                    />
                                </th>
                                <th style={thCellStyle}>Data</th>
                                <th style={thCellStyle}>Descrição</th>
                                <th style={thCellStyle}>Categoria</th>
                                <th style={thCellStyle}>Tipo</th>
                                <th style={{ ...thCellStyle, textAlign: "right" }}>Valor</th>
                                <th style={{ ...thCellStyle, textAlign: "center" }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoadingTransactions ? (
                                <tr>
                                    <td colSpan={7} style={{ ...tdCellStyle, textAlign: "center", padding: "4rem", color: muted, border: "none" }}>
                                        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                            </svg>
                                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                            <span>Carregando movimentações...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paged.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ ...tdCellStyle, textAlign: "center", padding: "4rem", color: muted, border: "none" }}>
                                        Nenhuma movimentação encontrada.
                                    </td>
                                </tr>
                            ) : paged.map((tx) => {
                                const isIncome = tx.type === "receita";
                                const inst = bankById(tx.institution);
                                const isSelected = selected.has(tx.id);

                                return (
                                    <tr
                                        key={tx.id}
                                        style={{
                                            backgroundColor: isSelected ? (isDark ? `${primary}12` : `${primary}06`) : "transparent",
                                            transition: "background-color 0.1s ease",
                                        }}
                                    >
                                        <td style={{ ...tdCellStyle, width: "4rem" }}>
                                            <input
                                                type="checkbox"
                                                aria-label={`Selecionar ${tx.description}`}
                                                checked={isSelected}
                                                onChange={() => toggleSelect(tx.id)}
                                                style={{ width: "1.5rem", height: "1.5rem", accentColor: primary, cursor: "pointer" }}
                                            />
                                        </td>

                                        <td style={{ ...tdCellStyle, whiteSpace: "nowrap" }}>
                                            <div style={{ fontSize: "1.3rem", fontWeight: 500, color: f.colors.text.primary }}>
                                                {formatDate(tx.date)}
                                            </div>
                                        </td>

                                        <td style={tdCellStyle}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                {inst && (
                                                    <div style={{
                                                        width: "3.2rem", height: "3.2rem", borderRadius: "0.6rem",
                                                        backgroundColor: inst.color,
                                                        color: "#fff", fontSize: "0.9rem", fontWeight: 700,
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        flexShrink: 0,
                                                    }}>
                                                        {inst.abbr}
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontSize: "1.3rem", fontWeight: 600, color: f.colors.text.primary }}>
                                                        {tx.description}
                                                    </div>
                                                    {tx.subDescription && (
                                                        <div style={{ fontSize: "1.1rem", color: muted }}>{tx.subDescription}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td style={tdCellStyle}>
                                            <CategoryBadge cat={categoryById(tx.category)} f={f} theme={theme} />
                                        </td>

                                        <td style={tdCellStyle}>
                                            <TypeBadge type={tx.type} f={f} />
                                        </td>

                                        <td style={{ ...tdCellStyle, textAlign: "right", whiteSpace: "nowrap" }}>
                                            <span style={{
                                                fontSize: "1.4rem", fontWeight: 700,
                                                color: isIncome ? f.colors.feedback.success : f.colors.feedback.error,
                                            }}>
                                                {isIncome ? "" : "- "}{formatCurrency(tx.amount)}
                                            </span>
                                            <div style={{ fontSize: "1.1rem", color: muted }}>
                                                {paymentMethods.find((m) => m.id === tx.method)?.label}
                                            </div>
                                        </td>

                                        <td style={{ ...tdCellStyle, textAlign: "center" }}>
                                            <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
                                                <button
                                                    type="button"
                                                    aria-label={`Editar ${tx.description}`}
                                                    onClick={() => handleEdit(tx)}
                                                    style={{ background: "none", border: "none", color: muted, cursor: "pointer", padding: "0.4rem", borderRadius: "0.4rem" }}
                                                    title="Editar"
                                                >
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                        <path d="m15 5 4 4" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    aria-label={`Excluir ${tx.description}`}
                                                    onClick={() => setConfirmDelete(tx)}
                                                    style={{ background: "none", border: "none", color: muted, cursor: "pointer", padding: "0.4rem", borderRadius: "0.4rem" }}
                                                    title="Excluir"
                                                >
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Table footer */}
                {!isLoadingTransactions && (
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "1.2rem 2rem", borderTop: `1px solid ${border}`,
                        flexWrap: "wrap", gap: "1rem",
                    }}>
                        <span style={{ fontSize: "1.2rem", color: muted }}>
                            {filtered.length > 0 ? (
                                <>
                                    Mostrando{" "}
                                    <strong style={{ color: f.colors.text.secondary }}>{showCount}</strong>
                                    {" "}de{" "}
                                    <strong style={{ color: f.colors.text.secondary }}>{filtered.length}</strong>
                                    {" "}resultados
                                </>
                            ) : "Nenhum resultado"}
                        </span>
                        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                            {renderPagination()}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <NewTransactionModal
                open={showNew}
                onClose={() => { setShowNew(false); setEditingTx(null); }}
                onSave={handleSave}
                initial={editingTx}
                theme={theme}
            />
            <ImportModal
                open={showImport}
                onClose={() => setShowImport(false)}
                onSuccess={refreshTransactions}
                theme={theme}
            />
            <ConfirmDialog
                open={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete.id); }}
                title="Excluir movimentação"
                message={confirmDelete && (
                    <>
                        Tem certeza que deseja excluir <strong>{confirmDelete.description}</strong>
                        {" "}({formatCurrency(confirmDelete.amount)})? Essa ação não pode ser desfeita.
                    </>
                )}
                theme={theme}
            />
            <TransactionFeedback
                kind={feedback?.kind ?? null}
                description={feedback?.description}
                onDone={() => setFeedback(null)}
                theme={theme}
            />
            <ConfettiBurst trigger={confettiTrigger} colors={confettiColors} />
        </div>
    );
}
