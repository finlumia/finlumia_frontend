"use client";

import React, { useCallback, useEffect, useState } from "react";
import { DataTable, type ColumnDef } from "../../organisms/DataTable";
import { CrudModal } from "../../organisms/CrudModal";
import { ConfigLayout, StatusBadge, CodeChip } from "./_shared";
import { cfgFunctionsService } from "../../../services/configurator/configurator.service";
import type { CfgFunction, CfgFunctionCreateRequest } from "../../../api/types";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { useTheme } from "../../../shared/styles/theme.context";

const LANG_COLORS: Record<string, string> = {
    plpgsql: "#0072B2", sql: "#009E73", javascript: "#E69F00",
};

const VOLATILITY_COLORS: Record<string, string> = {
    volatile: "#D55E00", stable: "#0072B2", immutable: "#009E73",
};

export function FunctionsPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const [data, setData] = useState<CfgFunction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<CfgFunction | null>(null);
    const [modalError, setModalError] = useState("");

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await cfgFunctionsService.list();
            setData(res.data);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const columns: ColumnDef<CfgFunction>[] = [
        {
            key: "name", label: "Função", sortable: true,
            render: (row) => (
                <div>
                    <CodeChip value={`${row.schema}.${row.name}()`} f={f} />
                    <div style={{ fontSize: "1.1rem", color: f.colors.text.muted, marginTop: "0.3rem", maxWidth: "28rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {row.description}
                    </div>
                </div>
            ),
        },
        {
            key: "language", label: "Linguagem", sortable: true,
            render: (row) => {
                const color = LANG_COLORS[row.language] ?? f.colors.text.secondary;
                return <span style={{ fontSize: "1.2rem", fontWeight: 600, fontFamily: "monospace", color, backgroundColor: `${color}15`, padding: "0.2rem 0.6rem", borderRadius: "0.4rem" }}>{row.language}</span>;
            },
        },
        { key: "returnType", label: "Retorno", render: (row) => <CodeChip value={row.returnType} f={f} /> },
        {
            key: "args", label: "Parâmetros",
            render: (row) => row.args
                ? <span style={{ fontSize: "1.1rem", fontFamily: "monospace", color: f.colors.text.secondary }}>{row.args}</span>
                : <span style={{ color: f.colors.text.muted }}>void</span>,
        },
        {
            key: "volatility", label: "Volatilidade",
            render: (row) => {
                const color = VOLATILITY_COLORS[row.volatility] ?? f.colors.text.secondary;
                return <span style={{ fontSize: "1.1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color }}>{row.volatility}</span>;
            },
        },
        { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} f={f} isDark={isDark} /> },
    ];

    const formFields = [
        { key: "name",       label: "Nome da função",  type: "text" as const, required: true, placeholder: "ex: get_user_balance" },
        { key: "schema",     label: "Schema",          type: "select" as const, required: true,
          options: ["public","auth","log","cache","billing"].map((s) => ({ value: s, label: s })) },
        { key: "language",   label: "Linguagem",       type: "badge-select" as const, required: true,
          options: [{ value: "plpgsql", label: "PL/pgSQL" }, { value: "sql", label: "SQL" }, { value: "javascript", label: "JavaScript" }],
          badgeColor: (v: string) => LANG_COLORS[v] ?? f.colors.text.muted },
        { key: "returnType", label: "Tipo de retorno", type: "text" as const, required: true, placeholder: "ex: decimal, void, table" },
        { key: "args",       label: "Parâmetros",      type: "text" as const, placeholder: "ex: user_id uuid, amount decimal" },
        { key: "volatility", label: "Volatilidade",    type: "badge-select" as const, required: true,
          options: [{ value: "volatile", label: "Volatile" }, { value: "stable", label: "Stable" }, { value: "immutable", label: "Immutable" }],
          badgeColor: (v: string) => VOLATILITY_COLORS[v] ?? f.colors.text.muted },
        { key: "status",     label: "Status",          type: "badge-select" as const,
          options: [{ value: "ativo", label: "Ativo" }, { value: "inativo", label: "Inativo" }],
          badgeColor: (v: string) => v === "ativo" ? f.colors.feedback.success : f.colors.text.muted },
        { key: "body",        label: "Corpo da função", type: "textarea" as const, required: true, placeholder: "BEGIN\n  -- lógica aqui\nEND;", span: "full" as const },
        { key: "description", label: "Descrição",       type: "textarea" as const, placeholder: "O que esta função faz...", span: "full" as const },
    ];

    const handleSave = async (formData: Record<string, unknown>) => {
        setModalError("");
        try {
            if (editing) {
                const updated = await cfgFunctionsService.update(editing.id, formData as Partial<CfgFunctionCreateRequest>);
                setData((prev) => prev.map((r) => r.id === editing.id ? updated : r));
            } else {
                const created = await cfgFunctionsService.create(formData as CfgFunctionCreateRequest);
                setData((prev) => [created, ...prev]);
            }
            setModalOpen(false);
            setEditing(null);
        } catch (err: unknown) {
            setModalError((err as { message?: string })?.message ?? "Erro ao salvar. Tente novamente.");
        }
    };

    const handleDelete = async (row: CfgFunction) => {
        try {
            await cfgFunctionsService.delete(row.id);
            setData((prev) => prev.filter((r) => r.id !== row.id));
        } catch { /* keep data */ }
    };

    return (
        <ConfigLayout activeTab="functions" theme={theme}>
            {modalError && (
                <div style={{ marginBottom: "1.6rem", padding: "1.2rem 1.6rem", borderRadius: "0.8rem", backgroundColor: isDark ? f.colors.feedback.errorBg : "#FEF2F2", border: `1px solid ${f.colors.feedback.error}`, color: f.colors.feedback.error, fontSize: "1.3rem" }}>
                    {modalError}
                </div>
            )}
            <DataTable
                columns={columns}
                data={data}
                keyField="id"
                theme={theme}
                loading={isLoading}
                title="Funções do banco de dados"
                subtitle="Stored procedures, funções SQL e PL/pgSQL"
                newLabel="+ Nova função"
                onNew={() => { setEditing(null); setModalError(""); setModalOpen(true); }}
                onEdit={(row) => { setEditing(row); setModalError(""); setModalOpen(true); }}
                onDelete={handleDelete}
                searchPlaceholder="Buscar por nome ou schema..."
            />
            <CrudModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditing(null); setModalError(""); }}
                onSave={handleSave}
                title={editing ? "Editar função" : "Nova função"}
                subtitle="Configurador — Funções"
                fields={formFields}
                initial={editing as unknown as Record<string, unknown> ?? {}}
                isEdit={!!editing}
                theme={theme}
            />
        </ConfigLayout>
    );
}
