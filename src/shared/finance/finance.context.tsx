"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import {
    CATEGORIES as DEFAULT_CATEGORIES,
    INSTITUTIONS as DEFAULT_INSTITUTIONS,
    PAYMENT_METHODS as DEFAULT_METHODS,
    MOCK_TRANSACTIONS,
    type Transaction,
} from "../../config/transactions";
import { legacyMonthToPeriod, periodsOverlap, formatDateShort, type DatePeriod } from "./period.utils";

// ── Catalog types (user-extensible) ─────────────────────────────────────────

export type Category = { id: string; label: string; color: string; bgColor: string; isDefault: boolean };
export type Bank = { id: string; label: string; color: string; abbr: string; isDefault: boolean };
export type PayMethod = { id: string; label: string; isDefault: boolean };

export type BudgetScope = "global" | "category" | "method" | "bank";

export type Budget = {
    id: string;
    name: string;
    scope: BudgetScope;
    refId: string | null; // category / method / bank id; null for global
    amount: number;        // limit for the period (R$)
    periodStart: string;   // ISO yyyy-MM-dd
    periodEnd: string;     // ISO yyyy-MM-dd
};

/** @deprecated Legacy shape persisted before period support */
type LegacyBudget = Budget & { month?: string };

// ── Defaults projected into catalog shape ───────────────────────────────────

const DEFAULT_CATS: Category[] = DEFAULT_CATEGORIES.map((c) => ({ ...c, isDefault: true }));
const DEFAULT_BANKS: Bank[] = DEFAULT_INSTITUTIONS.map((b) => ({ ...b, isDefault: true }));
const DEFAULT_PAY: PayMethod[] = DEFAULT_METHODS.map((m) => ({ ...m, isDefault: true }));

// ── Persistence helpers ─────────────────────────────────────────────────────

const KEYS = {
    customCategories: "finlumia-custom-categories",
    customBanks: "finlumia-custom-banks",
    customMethods: "finlumia-custom-methods",
    budgets: "finlumia-budgets",
    transactions: "finlumia-transactions",
};

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
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `item-${Date.now()}`;

const uid = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function normalizeBudget(raw: LegacyBudget): Budget {
    if (raw.periodStart && raw.periodEnd) {
        const { month: _m, ...rest } = raw;
        return rest;
    }
    if (raw.month) {
        const { month, ...rest } = raw;
        const period = legacyMonthToPeriod(month);
        return { ...rest, periodStart: period.start, periodEnd: period.end };
    }
    const period = legacyMonthToPeriod(new Date().toISOString().slice(0, 7));
    return { ...raw, periodStart: period.start, periodEnd: period.end };
}

// ── Context shape ───────────────────────────────────────────────────────────

export type BudgetStatus = Budget & {
    spent: number;
    remaining: number;
    percent: number;
    exceeded: boolean;
    scopeLabel: string;
    periodLabel: string;
};

type FinanceContextValue = {
    categories: Category[];
    banks: Bank[];
    paymentMethods: PayMethod[];
    transactions: Transaction[];
    budgets: Budget[];

    addCategory: (input: { label: string; color: string; bgColor?: string }) => void;
    removeCategory: (id: string) => void;

    addBank: (input: { label: string; color: string; abbr: string }) => void;
    removeBank: (id: string) => void;

    addPaymentMethod: (input: { label: string }) => void;
    removePaymentMethod: (id: string) => void;

    addTransaction: (t: Omit<Transaction, "id">) => void;
    addTransactions: (ts: Omit<Transaction, "id">[]) => void;
    removeTransaction: (id: string) => void;

    addBudget: (b: Omit<Budget, "id">) => void;
    updateBudget: (id: string, patch: Partial<Omit<Budget, "id">>) => void;
    removeBudget: (id: string) => void;

    /** Budgets overlapping the filter period, with spent calculated over each budget's own period. */
    budgetStatusFor: (filter: DatePeriod) => BudgetStatus[];
    /** Helpers to resolve labels/colors from ids (custom-aware). */
    categoryById: (id: string) => Category | undefined;
    bankById: (id: string) => Bank | undefined;
    methodById: (id: string) => PayMethod | undefined;
};

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

export function FinanceProvider({ children }: PropsWithChildren) {
    const [customCategories, setCustomCategories] = useState<Category[]>([]);
    const [customBanks, setCustomBanks] = useState<Bank[]>([]);
    const [customMethods, setCustomMethods] = useState<PayMethod[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>(
        MOCK_TRANSACTIONS.map((t, i) => ({ ...t, id: String(i + 1) })),
    );

    // Hydrate from localStorage after mount (avoids SSR mismatch).
    useEffect(() => {
        setCustomCategories(loadJSON<Category[]>(KEYS.customCategories, []));
        setCustomBanks(loadJSON<Bank[]>(KEYS.customBanks, []));
        setCustomMethods(loadJSON<PayMethod[]>(KEYS.customMethods, []));
        setBudgets(loadJSON<LegacyBudget[]>(KEYS.budgets, []).map(normalizeBudget));
        const storedTx = loadJSON<Transaction[] | null>(KEYS.transactions, null);
        if (storedTx) setTransactions(storedTx);
    }, []);

    // Persist on change.
    useEffect(() => { saveJSON(KEYS.customCategories, customCategories); }, [customCategories]);
    useEffect(() => { saveJSON(KEYS.customBanks, customBanks); }, [customBanks]);
    useEffect(() => { saveJSON(KEYS.customMethods, customMethods); }, [customMethods]);
    useEffect(() => { saveJSON(KEYS.budgets, budgets); }, [budgets]);
    useEffect(() => { saveJSON(KEYS.transactions, transactions); }, [transactions]);

    const categories = useMemo(() => [...DEFAULT_CATS, ...customCategories], [customCategories]);
    const banks = useMemo(() => [...DEFAULT_BANKS, ...customBanks], [customBanks]);
    const paymentMethods = useMemo(() => [...DEFAULT_PAY, ...customMethods], [customMethods]);

    // ── Catalog mutations ──
    const addCategory: FinanceContextValue["addCategory"] = useCallback((input) => {
        const id = slugify(input.label);
        setCustomCategories((prev) =>
            prev.some((c) => c.id === id)
                ? prev
                : [...prev, { id, label: input.label, color: input.color, bgColor: input.bgColor ?? `${input.color}22`, isDefault: false }],
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
    const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
        setTransactions((prev) => [{ ...t, id: uid() }, ...prev]);
    }, []);
    const addTransactions = useCallback((ts: Omit<Transaction, "id">[]) => {
        setTransactions((prev) => [...ts.map((t) => ({ ...t, id: uid() })), ...prev]);
    }, []);
    const removeTransaction = useCallback((id: string) => {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // ── Budget mutations ──
    const addBudget = useCallback((b: Omit<Budget, "id">) => {
        setBudgets((prev) => [...prev, { ...b, id: uid() }]);
    }, []);
    const updateBudget = useCallback((id: string, patch: Partial<Omit<Budget, "id">>) => {
        setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    }, []);
    const removeBudget = useCallback((id: string) => {
        setBudgets((prev) => prev.filter((b) => b.id !== id));
    }, []);

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
                    const periodTx = transactions.filter(
                        (t) => t.type === "despesa"
                            && t.date >= b.periodStart
                            && t.date <= b.periodEnd,
                    );
                    const spent = periodTx
                        .filter((t) => {
                            if (b.scope === "global") return true;
                            if (b.scope === "category") return t.category === b.refId;
                            if (b.scope === "method") return t.method === b.refId;
                            if (b.scope === "bank") return t.institution === b.refId;
                            return false;
                        })
                        .reduce((sum, t) => sum + t.amount, 0);
                    const remaining = b.amount - spent;
                    const percent = b.amount > 0 ? (spent / b.amount) * 100 : 0;
                    let scopeLabel = "Geral (todas as despesas)";
                    if (b.scope === "category") scopeLabel = `Setor: ${categoryById(b.refId ?? "")?.label ?? b.refId}`;
                    if (b.scope === "method") scopeLabel = `Forma de pagamento: ${methodById(b.refId ?? "")?.label ?? b.refId}`;
                    if (b.scope === "bank") scopeLabel = `Banco: ${bankById(b.refId ?? "")?.label ?? b.refId}`;
                    const periodLabel = b.periodStart === b.periodEnd
                        ? formatDateShort(b.periodStart)
                        : `${formatDateShort(b.periodStart)} – ${formatDateShort(b.periodEnd)}`;
                    return { ...b, spent, remaining, percent, exceeded: spent > b.amount, scopeLabel, periodLabel };
                });
        },
        [budgets, transactions, categoryById, methodById, bankById],
    );

    const value = useMemo<FinanceContextValue>(
        () => ({
            categories, banks, paymentMethods, transactions, budgets,
            addCategory, removeCategory,
            addBank, removeBank,
            addPaymentMethod, removePaymentMethod,
            addTransaction, addTransactions, removeTransaction,
            addBudget, updateBudget, removeBudget,
            budgetStatusFor, categoryById, bankById, methodById,
        }),
        [
            categories, banks, paymentMethods, transactions, budgets,
            addCategory, removeCategory, addBank, removeBank, addPaymentMethod, removePaymentMethod,
            addTransaction, addTransactions, removeTransaction, addBudget, updateBudget, removeBudget,
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
