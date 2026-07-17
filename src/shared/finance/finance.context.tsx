"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import {
    CATEGORIES as DEFAULT_CATEGORIES,
    INSTITUTIONS as DEFAULT_INSTITUTIONS,
    PAYMENT_METHODS as DEFAULT_METHODS,
    type Transaction,
    type CategoryAppliesTo,
} from "../../config/transactions";
import { periodsOverlap, formatDateShort, type DatePeriod } from "./period.utils";
import {
    transactionsService,
    categoriesService,
    institutionsService,
    budgetsService,
    type BudgetView,
    type BudgetType,
    type BudgetScope,
} from "../../services/movimentation/movement.service";
import { useAuth } from "../../contexts/auth.context";

// ── Catalog types (user-extensible) ─────────────────────────────────────────

export type Category = { id: string; label: string; color: string; bgColor: string; isDefault: boolean; appliesTo: CategoryAppliesTo };
export type Bank = { id: string; label: string; color: string; abbr: string; isDefault: boolean };
export type PayMethod = { id: string; label: string; isDefault: boolean };

export type { BudgetType, BudgetScope, BudgetView };

// ── Defaults projected into catalog shape ───────────────────────────────────

const DEFAULT_CATS: Category[] = DEFAULT_CATEGORIES.map((c) => ({ ...c, isDefault: true }));
const DEFAULT_BANKS: Bank[] = DEFAULT_INSTITUTIONS.map((b) => ({ ...b, isDefault: true }));
const DEFAULT_PAY: PayMethod[] = DEFAULT_METHODS.map((m) => ({ ...m, isDefault: true }));

// ── Persistence helpers ─────────────────────────────────────────────────────

const KEYS = {
    customCategories: "finlumia-custom-categories",
    customBanks: "finlumia-custom-banks",
    customMethods: "finlumia-custom-methods",
};

// As chaves são namespaced por usuário: sem isso, duas contas usando o mesmo
// navegador (comum no ambiente de demonstração) enxergam os dados customizados
// (categorias, bancos, formas de pagamento, orçamentos) uma da outra, já que
// esses dados só existem no localStorage e nunca são limpos entre sessões.
function scopedKey(base: string, userId: string): string {
    return `${base}:${userId}`;
}

function loadJSON<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
        const raw = window.localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

function saveJSON(key: string, value: unknown) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* ignore quota / serialization errors */
    }
}

const slugify = (value: string) =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `item-${Date.now()}`;

// ── Context shape ───────────────────────────────────────────────────────────

export type BudgetStatus = BudgetView & {
    remaining: number;
    exceeded: boolean;
    scopeLabel: string;
    periodLabel: string;
};

type FinanceContextValue = {
    categories: Category[];
    banks: Bank[];
    paymentMethods: PayMethod[];
    transactions: Transaction[];
    budgets: BudgetView[];
    isLoadingTransactions: boolean;

    addCategory: (input: { label: string; color: string; bgColor?: string; appliesTo?: CategoryAppliesTo }) => void;
    removeCategory: (id: string) => void;

    addBank: (input: { label: string; color: string; abbr: string }) => void;
    removeBank: (id: string) => void;

    addPaymentMethod: (input: { label: string }) => void;
    removePaymentMethod: (id: string) => void;

    /** Appends a transaction that already has an API-assigned id (e.g. after create). */
    appendTransaction: (t: Transaction) => void;
    /** Replaces a transaction in local state (call after API update). */
    updateTransaction: (id: string, t: Transaction) => void;
    /** Removes a transaction from local state (call after API delete). */
    removeTransaction: (id: string) => void;
    /** Refetches all transactions from the API. */
    refreshTransactions: () => Promise<void>;
    /** Loads transactions + catalog (categories/institutions) on demand. Safe to call multiple times — only fetches once per session. */
    loadData: () => void;

    isLoadingBudgets: boolean;
    /** Appends a budget that already has an API-assigned id (call after create). */
    appendBudget: (b: BudgetView) => void;
    /** Replaces a budget in local state (call after API update). */
    updateBudget: (id: string, b: BudgetView) => void;
    /** Removes a budget from local state (call after API delete). */
    removeBudget: (id: string) => void;
    /** Refetches all budgets from the API. */
    refreshBudgets: () => Promise<void>;

    budgetStatusFor: (filter: DatePeriod) => BudgetStatus[];
    categoryById: (id: string) => Category | undefined;
    bankById: (id: string) => Bank | undefined;
    methodById: (id: string) => PayMethod | undefined;
};

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

export function FinanceProvider({ children }: PropsWithChildren) {
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();
    const userId = user?.id ?? null;
    const [customCategories, setCustomCategories] = useState<Category[]>([]);
    const [customBanks, setCustomBanks] = useState<Bank[]>([]);
    const [customMethods, setCustomMethods] = useState<PayMethod[]>([]);
    const [budgets, setBudgets] = useState<BudgetView[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
    const [isLoadingBudgets, setIsLoadingBudgets] = useState(false);
    const dataLoadedRef = useRef(false);
    const hydratedForUserRef = useRef<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        setIsLoadingTransactions(true);
        try {
            // API limita pageSize a 100 — busca todas as páginas e concatena.
            const MAX_PAGE_SIZE = 100;
            const first = await transactionsService.list({
                page: 1, pageSize: MAX_PAGE_SIZE, sortBy: "date", sortOrder: "desc",
            });
            const all = [...first.data];
            const totalPages = first.meta.totalPages ?? 1;
            for (let page = 2; page <= totalPages; page++) {
                const res = await transactionsService.list({
                    page, pageSize: MAX_PAGE_SIZE, sortBy: "date", sortOrder: "desc",
                });
                all.push(...res.data);
            }
            setTransactions(all as unknown as Transaction[]);
        } catch {
            /* keep empty — auth redirect or server error */
        } finally {
            setIsLoadingTransactions(false);
        }
    }, []);

    const fetchBudgets = useCallback(async () => {
        setIsLoadingBudgets(true);
        try {
            const MAX_PAGE_SIZE = 100;
            const first = await budgetsService.list({ page: 1, pageSize: MAX_PAGE_SIZE });
            const all = [...first.data];
            const totalPages = first.meta.totalPages ?? 1;
            for (let page = 2; page <= totalPages; page++) {
                const res = await budgetsService.list({ page, pageSize: MAX_PAGE_SIZE });
                all.push(...res.data);
            }
            setBudgets(all);
        } catch {
            /* keep empty — auth redirect or server error */
        } finally {
            setIsLoadingBudgets(false);
        }
    }, []);

    // Hidrata o localStorage por usuário. Reage a userId (não só ao mount):
    // ao trocar de conta no mesmo navegador, zera o estado em memória e troca
    // para as chaves da nova conta — nunca reaproveita dados da conta anterior.
    useEffect(() => {
        if (hydratedForUserRef.current === userId) return;
        hydratedForUserRef.current = userId;

        if (!userId) {
            setCustomCategories([]);
            setCustomBanks([]);
            setCustomMethods([]);
            setBudgets([]);
            setTransactions([]);
            dataLoadedRef.current = false;
            return;
        }

        setCustomCategories(loadJSON<Category[]>(scopedKey(KEYS.customCategories, userId), []));
        setCustomBanks(loadJSON<Bank[]>(scopedKey(KEYS.customBanks, userId), []));
        setCustomMethods(loadJSON<PayMethod[]>(scopedKey(KEYS.customMethods, userId), []));
        setBudgets([]);
        setTransactions([]);
        dataLoadedRef.current = false;
    }, [userId]);

    // loadData — called explicitly by pages that need the full dataset (e.g. MovimentationPage).
    // Runs only once per session; subsequent calls are no-ops.
    const loadData = useCallback(() => {
        if (dataLoadedRef.current || !isAuthenticated || authLoading) return;
        dataLoadedRef.current = true;

        fetchTransactions();
        fetchBudgets();

        categoriesService.list().then((apiCats) => {
            setCustomCategories((prev) => {
                const existingIds = new Set([...DEFAULT_CATS.map((c) => c.id), ...prev.map((c) => c.id)]);
                const newCats: Category[] = apiCats
                    .filter((ac) => !existingIds.has(ac.id))
                    .map((ac) => ({
                        id: ac.id,
                        label: ac.label,
                        color: ac.color ?? "#9DAAB8",
                        bgColor: ac.color ? `${ac.color}22` : "#1C2430",
                        isDefault: false,
                        appliesTo: "ambos" as CategoryAppliesTo,
                    }));
                return newCats.length > 0 ? [...prev, ...newCats] : prev;
            });
        }).catch(() => { /* use defaults */ });

        institutionsService.list().then((apiInsts) => {
            setCustomBanks((prev) => {
                const existingIds = new Set([...DEFAULT_BANKS.map((b) => b.id), ...prev.map((b) => b.id)]);
                const newBanks: Bank[] = apiInsts
                    .filter((ai) => !existingIds.has(ai.id))
                    .map((ai) => ({
                        id: ai.id,
                        label: ai.label,
                        color: ai.color ?? "#9DAAB8",
                        abbr: ai.abbr ?? ai.label.slice(0, 2).toUpperCase(),
                        isDefault: false,
                    }));
                return newBanks.length > 0 ? [...prev, ...newBanks] : prev;
            });
        }).catch(() => { /* use defaults */ });
    }, [isAuthenticated, authLoading, fetchTransactions, fetchBudgets]);

    // Persist custom data on change.
    // Nunca grava sem userId — evitaria vazar para uma chave global reaproveitável
    // pela próxima conta a logar no mesmo navegador.
    useEffect(() => { if (userId) saveJSON(scopedKey(KEYS.customCategories, userId), customCategories); }, [userId, customCategories]);
    useEffect(() => { if (userId) saveJSON(scopedKey(KEYS.customBanks, userId), customBanks); }, [userId, customBanks]);
    useEffect(() => { if (userId) saveJSON(scopedKey(KEYS.customMethods, userId), customMethods); }, [userId, customMethods]);

    const categories = useMemo(() => [...DEFAULT_CATS, ...customCategories], [customCategories]);
    const banks = useMemo(() => [...DEFAULT_BANKS, ...customBanks], [customBanks]);
    const paymentMethods = useMemo(() => [...DEFAULT_PAY, ...customMethods], [customMethods]);

    // ── Catalog mutations ──
    const addCategory: FinanceContextValue["addCategory"] = useCallback((input) => {
        const id = slugify(input.label);
        setCustomCategories((prev) =>
            prev.some((c) => c.id === id)
                ? prev
                : [...prev, {
                    id, label: input.label, color: input.color,
                    bgColor: input.bgColor ?? `${input.color}22`,
                    isDefault: false, appliesTo: input.appliesTo ?? "ambos",
                }],
        );
    }, []);
    const removeCategory = useCallback((id: string) => {
        setCustomCategories((prev) => prev.filter((c) => c.id !== id));
    }, []);

    const addBank: FinanceContextValue["addBank"] = useCallback((input) => {
        const id = slugify(input.label);
        setCustomBanks((prev) =>
            prev.some((b) => b.id === id)
                ? prev
                : [...prev, { id, label: input.label, color: input.color, abbr: input.abbr || input.label.slice(0, 2), isDefault: false }],
        );
    }, []);
    const removeBank = useCallback((id: string) => {
        setCustomBanks((prev) => prev.filter((b) => b.id !== id));
    }, []);

    const addPaymentMethod: FinanceContextValue["addPaymentMethod"] = useCallback((input) => {
        const id = slugify(input.label);
        setCustomMethods((prev) =>
            prev.some((m) => m.id === id) ? prev : [...prev, { id, label: input.label, isDefault: false }],
        );
    }, []);
    const removePaymentMethod = useCallback((id: string) => {
        setCustomMethods((prev) => prev.filter((m) => m.id !== id));
    }, []);

    // ── Transaction mutations ──
    const appendTransaction = useCallback((t: Transaction) => {
        setTransactions((prev) => [t, ...prev]);
    }, []);

    const updateTransaction = useCallback((id: string, t: Transaction) => {
        setTransactions((prev) => prev.map((p) => (p.id === id ? t : p)));
    }, []);

    const removeTransaction = useCallback((id: string) => {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const refreshTransactions = useCallback(async () => {
        await fetchTransactions();
    }, [fetchTransactions]);

    // ── Budget mutations (o backend calcula currentTotal/progressPercent — o
    // estado local só espelha o que a API já retornou em create/update/delete) ──
    const appendBudget = useCallback((b: BudgetView) => {
        setBudgets((prev) => [b, ...prev]);
    }, []);
    const updateBudget = useCallback((id: string, b: BudgetView) => {
        setBudgets((prev) => prev.map((p) => (p.id === id ? b : p)));
    }, []);
    const removeBudget = useCallback((id: string) => {
        setBudgets((prev) => prev.filter((b) => b.id !== id));
    }, []);
    const refreshBudgets = useCallback(async () => {
        await fetchBudgets();
    }, [fetchBudgets]);

    const categoryById = useCallback((id: string) => categories.find((c) => c.id === id), [categories]);
    const bankById = useCallback((id: string) => banks.find((b) => b.id === id), [banks]);
    const methodById = useCallback((id: string) => paymentMethods.find((m) => m.id === id), [paymentMethods]);

    const budgetStatusFor = useCallback(
        (filter: DatePeriod): BudgetStatus[] => {
            return budgets
                .filter((b) => periodsOverlap(
                    { start: b.periodStart, end: b.periodEnd },
                    filter,
                ))
                .map((b) => {
                    const remaining = b.limitAmount - b.currentTotal;
                    let scopeLabel = b.type === "receita" ? "Geral (todas as receitas)" : "Geral (todas as despesas)";
                    if (b.scope === "categoria") scopeLabel = `Setor: ${categoryById(b.scopeValue ?? "")?.label ?? b.scopeValue}`;
                    if (b.scope === "forma_pagamento") scopeLabel = `Forma de pagamento: ${methodById(b.scopeValue ?? "")?.label ?? b.scopeValue}`;
                    if (b.scope === "banco") scopeLabel = `Banco: ${bankById(b.scopeValue ?? "")?.label ?? b.scopeValue}`;
                    const periodLabel = b.periodStart === b.periodEnd
                        ? formatDateShort(b.periodStart)
                        : `${formatDateShort(b.periodStart)} – ${formatDateShort(b.periodEnd)}`;
                    // Para despesa, ultrapassar o limite é um alerta; para receita, atingir/superar a meta é sucesso.
                    return { ...b, remaining, exceeded: b.currentTotal > b.limitAmount, scopeLabel, periodLabel };
                });
        },
        [budgets, categoryById, methodById, bankById],
    );

    const value = useMemo<FinanceContextValue>(
        () => ({
            categories, banks, paymentMethods, transactions, budgets, isLoadingTransactions, isLoadingBudgets,
            addCategory, removeCategory,
            addBank, removeBank,
            addPaymentMethod, removePaymentMethod,
            appendTransaction, updateTransaction, removeTransaction, refreshTransactions, loadData,
            appendBudget, updateBudget, removeBudget, refreshBudgets,
            budgetStatusFor, categoryById, bankById, methodById,
        }),
        [
            categories, banks, paymentMethods, transactions, budgets, isLoadingTransactions, isLoadingBudgets,
            addCategory, removeCategory, addBank, removeBank, addPaymentMethod, removePaymentMethod,
            appendTransaction, updateTransaction, removeTransaction, refreshTransactions, loadData,
            appendBudget, updateBudget, removeBudget, refreshBudgets,
            budgetStatusFor, categoryById, bankById, methodById,
        ],
    );

    return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
    const ctx = useContext(FinanceContext);
    if (!ctx) throw new Error("useFinance must be used within a FinanceProvider.");
    return ctx;
}

export { currentMonthPeriod } from "./period.utils";
export type { DatePeriod } from "./period.utils";
