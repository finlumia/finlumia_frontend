"use client";

import React, { useState } from "react";
import { DataTable, type ColumnDef } from "../../organisms/DataTable";
import { CrudModal } from "../../organisms/CrudModal";
import { ConfigLayout, StatusBadge, CodeChip } from "./_shared";
import { MOCK_FUNCTIONS, type FunctionRecord } from "../../../config/configurator";
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

    const [data, setData] = useState<FunctionRecord[]>(MOCK_FUNCTIONS);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<FunctionRecord | null>(null);

    const columns: ColumnDef<FunctionRecord>[] = [
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
                const color = LANG_COLORS[row.language];
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
                const color = VOLATILITY_COLORS[row.volatility];
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
        { key: "description", label: "Descrição", type: "textarea" as const, placeholder: "O que esta função faz...", span: "full" as const },
    ];

    const handleSave = (formData: Record<string, unknown>) => {
        if (editing) {
            setData((prev) => prev.map((r) => r.id === editing.id ? { ...r, ...formData } as FunctionRecord : r));
        } else {
            setData((prev) => [{ ...formData, id: String(Date.now()), createdAt: new Date().toISOString().slice(0, 10) } as FunctionRecord, ...prev]);
        }
        setEditing(null);
    };

    return (
        <ConfigLayout activeTab="functions" theme={theme}>
            <DataTable
                columns={columns}
                data={data}
                keyField="id"
                theme={theme}
                title="Funções do banco de dados"
                subtitle="Stored procedures, funções SQL e PL/pgSQL"
                newLabel="+ Nova função"
                onNew={() => { setEditing(null); setModalOpen(true); }}
                onEdit={(row) => { setEditing(row); setModalOpen(true); }}
                onDelete={(row) => setData((prev) => prev.filter((r) => r.id !== row.id))}
                searchPlaceholder="Buscar por nome ou schema..."
            />
            <CrudModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditing(null); }}
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
