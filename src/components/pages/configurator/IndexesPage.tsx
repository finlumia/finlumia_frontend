"use client";

import React, { useState } from "react";
import { DataTable, type ColumnDef } from "../../organisms/DataTable";
import { CrudModal } from "../../organisms/CrudModal";
import { ConfigLayout, StatusBadge, BoolBadge, CodeChip } from "./_shared";
import { MOCK_INDEXES, MOCK_TABLES, type IndexRecord, type IndexType } from "../../../config/configurator";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { useTheme } from "../../../shared/styles/theme.context";

const INDEX_COLORS: Record<IndexType, string> = {
    btree: "#0072B2", hash: "#E69F00", gin: "#CC79A7", gist: "#009E73", brin: "#D55E00",
};

export function IndexesPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const [data, setData] = useState<IndexRecord[]>(MOCK_INDEXES);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<IndexRecord | null>(null);

    const tableNames = [...new Set(MOCK_TABLES.map((t) => t.name))];

    const columns: ColumnDef<IndexRecord>[] = [
        {
            key: "name", label: "Índice", sortable: true,
            render: (row) => <CodeChip value={row.name} f={f} />,
        },
        {
            key: "table", label: "Tabela", sortable: true,
            render: (row) => (
                <div>
                    <CodeChip value={row.table} f={f} />
                    <span style={{ fontSize: "1.1rem", color: f.colors.text.muted, marginLeft: "0.4rem" }}>{row.schema}</span>
                </div>
            ),
        },
        {
            key: "fields", label: "Campos indexados",
            render: (row) => <span style={{ fontSize: "1.2rem", fontFamily: "monospace", color: f.colors.text.secondary }}>{row.fields}</span>,
        },
        {
            key: "type", label: "Tipo", sortable: true,
            render: (row) => {
                const color = INDEX_COLORS[row.type];
                return <span style={{ fontFamily: "monospace", fontSize: "1.2rem", fontWeight: 700, color, backgroundColor: `${color}15`, padding: "0.15rem 0.5rem", borderRadius: "0.3rem" }}>{row.type.toUpperCase()}</span>;
            },
        },
        { key: "unique",  label: "Único",   align: "center", render: (row) => <BoolBadge value={row.unique}  f={f} /> },
        { key: "partial", label: "Parcial", align: "center", render: (row) => <BoolBadge value={row.partial} f={f} /> },
        {
            key: "sizeKb", label: "Tamanho", sortable: true, align: "right",
            render: (row) => <span style={{ color: f.colors.text.secondary }}>{row.sizeKb >= 1024 ? `${(row.sizeKb / 1024).toFixed(1)} MB` : `${row.sizeKb} KB`}</span>,
        },
        { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} f={f} isDark={isDark} /> },
    ];

    const formFields = [
        { key: "name",    label: "Nome do índice",    type: "text" as const, required: true, placeholder: "ex: transactions_user_id_idx" },
        { key: "table",   label: "Tabela",            type: "select" as const, required: true,
          options: tableNames.map((n) => ({ value: n, label: n })) },
        { key: "schema",  label: "Schema",            type: "select" as const, required: true,
          options: ["public","auth","log","cache","billing"].map((s) => ({ value: s, label: s })) },
        { key: "fields",  label: "Campos indexados",  type: "text" as const, required: true, placeholder: "ex: user_id, created_at DESC", span: "full" as const },
        { key: "type",    label: "Tipo de índice",    type: "badge-select" as const, required: true,
          options: [{ value: "btree", label: "B-Tree" }, { value: "hash", label: "Hash" }, { value: "gin", label: "GIN" }, { value: "gist", label: "GiST" }, { value: "brin", label: "BRIN" }],
          badgeColor: (v: string) => INDEX_COLORS[v as IndexType] ?? f.colors.text.muted },
        { key: "unique",  label: "Índice único (UNIQUE)",   type: "toggle" as const },
        { key: "partial", label: "Índice parcial (WHERE...)", type: "toggle" as const, hint: "Requer cláusula WHERE" },
        { key: "status",  label: "Status",            type: "badge-select" as const,
          options: [{ value: "ativo", label: "Ativo" }, { value: "inativo", label: "Inativo" }],
          badgeColor: (v: string) => v === "ativo" ? f.colors.feedback.success : f.colors.text.muted },
    ];

    const handleSave = (formData: Record<string, unknown>) => {
        if (editing) {
            setData((prev) => prev.map((r) => r.id === editing.id ? { ...r, ...formData } as IndexRecord : r));
        } else {
            setData((prev) => [{ ...formData, id: String(Date.now()), sizeKb: 0, createdAt: new Date().toISOString().slice(0, 10) } as IndexRecord, ...prev]);
        }
        setEditing(null);
    };

    return (
        <ConfigLayout activeTab="indexes" theme={theme}>
            <DataTable
                columns={columns}
                data={data as unknown as Record<string, unknown>[]}
                keyField="id"
                theme={theme}
                title="Índices do banco de dados"
                subtitle="B-Tree, Hash, GIN, GiST e BRIN — performance de consultas"
                newLabel="+ Novo índice"
                onNew={() => { setEditing(null); setModalOpen(true); }}
                onEdit={(row) => { setEditing(row as unknown as IndexRecord); setModalOpen(true); }}
                onDelete={(row) => setData((prev) => prev.filter((r) => r.id !== (row as unknown as IndexRecord).id))}
                searchPlaceholder="Buscar por nome ou tabela..."
            />
            <CrudModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditing(null); }}
                onSave={handleSave}
                title={editing ? "Editar índice" : "Novo índice"}
                subtitle="Configurador — Índices"
                fields={formFields}
                initial={editing as unknown as Record<string, unknown> ?? {}}
                isEdit={!!editing}
                theme={theme}
            />
        </ConfigLayout>
    );
}
