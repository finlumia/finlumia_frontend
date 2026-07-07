"use client";

import React, { useCallback, useEffect, useState } from "react";
import { DataTable, type ColumnDef } from "../../organisms/DataTable";
import { CrudModal } from "../../organisms/CrudModal";
import { ConfigLayout, StatusBadge, BoolBadge, CodeChip } from "./_shared";
import { cfgFieldsService, cfgTablesService } from "../../../services/configurator/configurator.service";
import type { CfgField, CfgFieldCreateRequest, CfgTable } from "../../../api/types";
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

    const [data, setData] = useState<CfgField[]>([]);
    const [tables, setTables] = useState<CfgTable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<CfgField | null>(null);
    const [tableFilter, setTableFilter] = useState("all");
    const [modalError, setModalError] = useState("");

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const [fieldsRes, tablesRes] = await Promise.all([
                cfgFieldsService.list(),
                cfgTablesService.list(),
            ]);
            setData(fieldsRes.data);
            setTables(tablesRes.data);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = tableFilter === "all" ? data : data.filter((r) => r.tableId === tableFilter);

    const columns: ColumnDef<CfgField>[] = [
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
                <span style={{ fontFamily: "monospace", fontSize: "1.2rem", fontWeight: 600, color: TYPE_COLORS[row.dataType] ?? f.colors.text.secondary }}>
                    {row.dataType}{row.length ? `(${row.length})` : ""}
                </span>
            ),
        },
        { key: "nullable",  label: "Nullable", align: "center", render: (row) => <BoolBadge value={row.nullable}  f={f} /> },
        { key: "isPrimary", label: "PK",       align: "center", render: (row) => <BoolBadge value={row.isPrimary} f={f} /> },
        { key: "isForeign", label: "FK",       align: "center", render: (row) => <BoolBadge value={row.isForeign} f={f} /> },
        {
            key: "defaultValue", label: "Default",
            render: (row) => row.defaultValue ? <CodeChip value={row.defaultValue} f={f} /> : <span style={{ color: f.colors.text.muted }}>—</span>,
        },
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
            {tables.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
    );

    const formFields = [
        { key: "name",    label: "Nome do campo",   type: "text" as const,   required: true, placeholder: "ex: user_id" },
        { key: "tableId", label: "Tabela",           type: "select" as const, required: true,
          options: tables.map((t) => ({ value: t.id, label: t.name })) },
        { key: "dataType", label: "Tipo de dado",   type: "select" as const, required: true,
          options: ["uuid","varchar","integer","bigint","boolean","timestamp","decimal","text","jsonb","serial"].map((t) => ({ value: t, label: t })) },
        { key: "length",       label: "Comprimento",      type: "number" as const, placeholder: "ex: 255" },
        { key: "defaultValue", label: "Valor padrão",     type: "text" as const,   placeholder: "ex: now()" },
        { key: "nullable",     label: "Permite NULL",             type: "toggle" as const },
        { key: "isPrimary",    label: "Chave primária (PK)",       type: "toggle" as const },
        { key: "isForeign",    label: "Chave estrangeira (FK)",    type: "toggle" as const },
        { key: "status", label: "Status", type: "badge-select" as const, required: true,
          options: [{ value: "ativo", label: "Ativo" }, { value: "inativo", label: "Inativo" }],
          badgeColor: (v: string) => v === "ativo" ? f.colors.feedback.success : f.colors.text.muted },
    ];

    const handleSave = async (formData: Record<string, unknown>) => {
        setModalError("");
        try {
            if (editing) {
                const updated = await cfgFieldsService.update(editing.id, formData as Partial<CfgFieldCreateRequest>);
                setData((prev) => prev.map((r) => r.id === editing.id ? updated : r));
            } else {
                const created = await cfgFieldsService.create(formData as CfgFieldCreateRequest);
                setData((prev) => [created, ...prev]);
            }
            setModalOpen(false);
            setEditing(null);
        } catch (err: unknown) {
            setModalError((err as { message?: string })?.message ?? "Erro ao salvar. Tente novamente.");
        }
    };

    const handleDelete = async (row: CfgField) => {
        try {
            await cfgFieldsService.delete(row.id);
            setData((prev) => prev.filter((r) => r.id !== row.id));
        } catch { /* keep data */ }
    };

    return (
        <ConfigLayout activeTab="fields" theme={theme}>
            {modalError && (
                <div style={{ marginBottom: "1.6rem", padding: "1.2rem 1.6rem", borderRadius: "0.8rem", backgroundColor: isDark ? f.colors.feedback.errorBg : "#FEF2F2", border: `1px solid ${f.colors.feedback.error}`, color: f.colors.feedback.error, fontSize: "1.3rem" }}>
                    {modalError}
                </div>
            )}
            <DataTable
                columns={columns}
                data={filtered}
                keyField="id"
                theme={theme}
                loading={isLoading}
                title="Campos das tabelas"
                subtitle="Gerencie os campos, tipos e constraints"
                newLabel="+ Novo campo"
                extraFilters={tableFilterEl}
                onNew={() => { setEditing(null); setModalError(""); setModalOpen(true); }}
                onEdit={(row) => { setEditing(row); setModalError(""); setModalOpen(true); }}
                onDelete={handleDelete}
                searchPlaceholder="Buscar por nome ou tabela..."
            />
            <CrudModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditing(null); setModalError(""); }}
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
