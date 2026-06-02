"use client";

import React, { useState } from "react";
import { DataTable, type ColumnDef } from "../../organisms/DataTable";
import { CrudModal } from "../../organisms/CrudModal";
import { ConfigLayout, StatusBadge, CodeChip } from "./_shared";
import { MOCK_TABLES, type TableRecord } from "../../../config/configurator";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { useTheme } from "../../../shared/styles/theme.context";

export function TablesPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const [data, setData] = useState<TableRecord[]>(MOCK_TABLES);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<TableRecord | null>(null);

    const columns: ColumnDef<TableRecord>[] = [
        {
            key: "name", label: "Tabela", sortable: true,
            render: (row) => (
                <div>
                    <CodeChip value={row.name} f={f} />
                    <div style={{ fontSize: "1.1rem", color: f.colors.text.muted, marginTop: "0.2rem" }}>schema: {row.schema}</div>
                </div>
            ),
        },
        { key: "schema", label: "Schema", sortable: true, render: (row) => <CodeChip value={row.schema} f={f} /> },
        {
            key: "rowCount", label: "Registros", sortable: true, align: "right",
            render: (row) => <span style={{ fontVariantNumeric: "tabular-nums", color: f.colors.text.primary }}>{row.rowCount.toLocaleString("pt-BR")}</span>,
        },
        {
            key: "sizeKb", label: "Tamanho", sortable: true, align: "right",
            render: (row) => <span style={{ color: f.colors.text.secondary }}>{row.sizeKb >= 1024 ? `${(row.sizeKb / 1024).toFixed(1)} MB` : `${row.sizeKb} KB`}</span>,
        },
        { key: "updatedAt", label: "Atualizado", sortable: true },
        { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} f={f} isDark={isDark} /> },
    ];

    const formFields = [
        { key: "name",      label: "Nome da tabela", type: "text" as const,  required: true, placeholder: "ex: transactions" },
        { key: "schema",    label: "Schema",         type: "select" as const, required: true,
          options: [{ value: "public", label: "public" }, { value: "auth", label: "auth" }, { value: "log", label: "log" }, { value: "cache", label: "cache" }, { value: "billing", label: "billing" }] },
        { key: "status",    label: "Status",         type: "badge-select" as const, required: true,
          options: [{ value: "ativo", label: "Ativo" }, { value: "inativo", label: "Inativo" }],
          badgeColor: (v: string) => v === "ativo" ? f.colors.feedback.success : f.colors.text.muted },
        { key: "description", label: "Descrição", type: "textarea" as const, placeholder: "Descreva o propósito desta tabela...", span: "full" as const },
    ];

    const handleSave = (formData: Record<string, unknown>) => {
        if (editing) {
            setData((prev) => prev.map((r) => r.id === editing.id ? { ...r, ...formData } as TableRecord : r));
        } else {
            setData((prev) => [{ ...formData, id: String(Date.now()), rowCount: 0, sizeKb: 0, createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10) } as TableRecord, ...prev]);
        }
        setEditing(null);
    };

    return (
        <ConfigLayout activeTab="tables" theme={theme}>
            <DataTable
                columns={columns}
                data={data}
                keyField="id"
                theme={theme}
                title="Tabelas do banco de dados"
                subtitle="Gerencie as tabelas e seus schemas"
                newLabel="+ Nova tabela"
                onNew={() => { setEditing(null); setModalOpen(true); }}
                onEdit={(row) => { setEditing(row); setModalOpen(true); }}
                onDelete={(row) => setData((prev) => prev.filter((r) => r.id !== row.id))}
                searchPlaceholder="Buscar por nome ou schema..."
                searchFields={["name", "schema"] as never[]}
            />
            <CrudModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditing(null); }}
                onSave={handleSave}
                title={editing ? "Editar tabela" : "Nova tabela"}
                subtitle="Configurador — Tabelas"
                fields={formFields}
                initial={editing as unknown as Record<string, unknown> ?? {}}
                isEdit={!!editing}
                theme={theme}
            />
        </ConfigLayout>
    );
}
