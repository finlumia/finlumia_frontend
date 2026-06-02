"use client";

import React, { useState } from "react";
import { DataTable, type ColumnDef } from "../../organisms/DataTable";
import { CrudModal } from "../../organisms/CrudModal";
import { ConfigLayout, StatusBadge, BoolBadge, CodeChip } from "./_shared";
import { MOCK_FIELDS, MOCK_TABLES, type FieldRecord } from "../../../config/configurator";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { useTheme } from "../../../shared/styles/theme.context";

const TYPE_COLORS: Record<string, string> = {
    uuid: "#CC79A7", varchar: "#56B4E9", integer: "#E69F00", bigint: "#E69F00",
    boolean: "#009E73", timestamp: "#0072B2", decimal: "#F0E442", text: "#56B4E9",
    jsonb: "#D55E00", serial: "#E69F00",
};

export function FieldsPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const [data, setData] = useState<FieldRecord[]>(MOCK_FIELDS);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<FieldRecord | null>(null);
    const [tableFilter, setTableFilter] = useState("all");

    const tableNames = [...new Set(MOCK_TABLES.map((t) => t.name))];
    const filtered = tableFilter === "all" ? data : data.filter((r) => r.table === tableFilter);

    const columns: ColumnDef<FieldRecord>[] = [
        {
            key: "name", label: "Campo", sortable: true,
            render: (row) => (
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    {row.isPrimary && <span style={{ fontSize: "0.9rem", color: f.colors.brand.accent }} title="Chave primária">🔑</span>}
                    {row.isForeign && <span style={{ fontSize: "0.9rem", color: f.colors.brand.primary }} title="Chave estrangeira">🔗</span>}
                    <CodeChip value={row.name} f={f} />
                </div>
            ),
        },
        { key: "table", label: "Tabela", sortable: true, render: (row) => <CodeChip value={row.table} f={f} /> },
        {
            key: "dataType", label: "Tipo", sortable: true,
            render: (row) => (
                <span style={{
                    fontFamily: "monospace", fontSize: "1.2rem", fontWeight: 600,
                    color: TYPE_COLORS[row.dataType] ?? f.colors.text.secondary,
                }}>
                    {row.dataType}{row.length ? `(${row.length})` : ""}
                </span>
            ),
        },
        { key: "nullable", label: "Nullable", align: "center", render: (row) => <BoolBadge value={row.nullable} f={f} /> },
        { key: "isPrimary", label: "PK", align: "center", render: (row) => <BoolBadge value={row.isPrimary} f={f} /> },
        { key: "isForeign", label: "FK", align: "center", render: (row) => <BoolBadge value={row.isForeign} f={f} /> },
        { key: "defaultValue", label: "Default", render: (row) => row.defaultValue ? <CodeChip value={row.defaultValue} f={f} /> : <span style={{ color: f.colors.text.muted }}>—</span> },
        { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} f={f} isDark={isDark} /> },
    ];

    const border = f.colors.border.default;
    const surface = isDark ? f.colors.bg.elevated : "#fff";

    const tableFilterEl = (
        <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            style={{
                height: "3.6rem", padding: "0 1.2rem", borderRadius: "0.8rem",
                border: `1px solid ${border}`, backgroundColor: surface,
                color: f.colors.text.primary, fontSize: "1.3rem",
                fontFamily: "inherit", cursor: "pointer", outline: "none",
            }}
        >
            <option value="all">Todas as tabelas</option>
            {tableNames.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
    );

    const formFields = [
        { key: "name", label: "Nome do campo", type: "text" as const, required: true, placeholder: "ex: user_id" },
        { key: "table", label: "Tabela", type: "select" as const, required: true,
          options: tableNames.map((n) => ({ value: n, label: n })) },
        { key: "dataType", label: "Tipo de dado", type: "select" as const, required: true,
          options: ["uuid","varchar","integer","bigint","boolean","timestamp","decimal","text","jsonb","serial"].map((t) => ({ value: t, label: t })) },
        { key: "length", label: "Comprimento", type: "number" as const, placeholder: "ex: 255" },
        { key: "defaultValue", label: "Valor padrão", type: "text" as const, placeholder: "ex: now()" },
        { key: "nullable", label: "Permite NULL", type: "toggle" as const },
        { key: "isPrimary", label: "Chave primária (PK)", type: "toggle" as const },
        { key: "isForeign", label: "Chave estrangeira (FK)", type: "toggle" as const },
        { key: "status", label: "Status", type: "badge-select" as const, required: true,
          options: [{ value: "ativo", label: "Ativo" }, { value: "inativo", label: "Inativo" }],
          badgeColor: (v: string) => v === "ativo" ? f.colors.feedback.success : f.colors.text.muted },
    ];

    const handleSave = (formData: Record<string, unknown>) => {
        if (editing) {
            setData((prev) => prev.map((r) => r.id === editing.id ? { ...r, ...formData } as FieldRecord : r));
        } else {
            setData((prev) => [{ ...formData, id: String(Date.now()) } as FieldRecord, ...prev]);
        }
        setEditing(null);
    };

    return (
        <ConfigLayout activeTab="fields" theme={theme}>
            <DataTable
                columns={columns}
                data={filtered}
                keyField="id"
                theme={theme}
                title="Campos das tabelas"
                subtitle="Gerencie os campos, tipos e constraints"
                newLabel="+ Novo campo"
                extraFilters={tableFilterEl}
                onNew={() => { setEditing(null); setModalOpen(true); }}
                onEdit={(row) => { setEditing(row); setModalOpen(true); }}
                onDelete={(row) => setData((prev) => prev.filter((r) => r.id !== row.id))}
                searchPlaceholder="Buscar por nome ou tabela..."
            />
            <CrudModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditing(null); }}
                onSave={handleSave}
                title={editing ? "Editar campo" : "Novo campo"}
                subtitle="Configurador — Campos"
                fields={formFields}
                initial={editing as unknown as Record<string, unknown> ?? {}}
                isEdit={!!editing}
                theme={theme}
            />
        </ConfigLayout>
    );
}
