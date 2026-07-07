"use client";

import React, { useCallback, useEffect, useState } from "react";
import { DataTable, type ColumnDef } from "../../organisms/DataTable";
import { CrudModal } from "../../organisms/CrudModal";
import { ConfigLayout, StatusBadge, BoolBadge, CodeChip } from "./_shared";
import { cfgIndexesService, cfgTablesService } from "../../../services/configurator/configurator.service";
import type { CfgIndex, CfgIndexCreateRequest, CfgTable, IndexType } from "../../../api/types";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { useTheme } from "../../../shared/styles/theme.context";

const INDEX_COLORS: Record<IndexType, string> = {
    btree: "#0072B2", hash: "#E69F00", gin: "#CC79A7", gist: "#009E73", brin: "#D55E00",
};

export function IndexesPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const [data, setData] = useState<CfgIndex[]>([]);
    const [tables, setTables] = useState<CfgTable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<CfgIndex | null>(null);
    const [modalError, setModalError] = useState("");
    const [rebuildingId, setRebuildingId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const [indexesRes, tablesRes] = await Promise.all([
                cfgIndexesService.list(),
                cfgTablesService.list(),
            ]);
            setData(indexesRes.data);
            setTables(tablesRes.data);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleRebuild = async (row: CfgIndex) => {
        setRebuildingId(row.id);
        try {
            await cfgIndexesService.rebuild(row.id);
        } finally {
            setRebuildingId(null);
        }
    };

    const columns: ColumnDef<CfgIndex>[] = [
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
                const color = INDEX_COLORS[row.type] ?? f.colors.text.secondary;
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
        {
            key: "id", label: "Ações",
            render: (row) => (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRebuild(row); }}
                    disabled={rebuildingId === row.id}
                    style={{
                        padding: "0.3rem 0.8rem", borderRadius: "0.5rem", fontSize: "1.1rem",
                        border: `1px solid ${f.colors.border.default}`,
                        backgroundColor: "transparent", color: f.colors.text.secondary,
                        cursor: rebuildingId === row.id ? "not-allowed" : "pointer",
                        opacity: rebuildingId === row.id ? 0.5 : 1,
                        fontFamily: "inherit",
                    }}
                >
                    {rebuildingId === row.id ? "Reconstruindo..." : "Reconstruir"}
                </button>
            ),
        },
    ];

    const formFields = [
        { key: "name",    label: "Nome do índice",   type: "text" as const, required: true, placeholder: "ex: transactions_user_id_idx" },
        { key: "tableId", label: "Tabela",           type: "select" as const, required: true,
          options: tables.map((t) => ({ value: t.id, label: t.name })) },
        { key: "schema",  label: "Schema",           type: "select" as const, required: true,
          options: ["public","auth","log","cache","billing"].map((s) => ({ value: s, label: s })) },
        { key: "fields",  label: "Campos indexados", type: "text" as const, required: true, placeholder: "ex: user_id, created_at DESC", span: "full" as const },
        { key: "type",    label: "Tipo de índice",   type: "badge-select" as const, required: true,
          options: [{ value: "btree", label: "B-Tree" }, { value: "hash", label: "Hash" }, { value: "gin", label: "GIN" }, { value: "gist", label: "GiST" }, { value: "brin", label: "BRIN" }],
          badgeColor: (v: string) => INDEX_COLORS[v as IndexType] ?? f.colors.text.muted },
        { key: "unique",  label: "Índice único (UNIQUE)",    type: "toggle" as const },
        { key: "partial", label: "Índice parcial (WHERE...)", type: "toggle" as const, hint: "Requer cláusula WHERE" },
        { key: "status",  label: "Status",           type: "badge-select" as const,
          options: [{ value: "ativo", label: "Ativo" }, { value: "inativo", label: "Inativo" }],
          badgeColor: (v: string) => v === "ativo" ? f.colors.feedback.success : f.colors.text.muted },
    ];

    const handleSave = async (formData: Record<string, unknown>) => {
        setModalError("");
        try {
            if (editing) {
                const updated = await cfgIndexesService.update(editing.id, formData as Partial<CfgIndexCreateRequest>);
                setData((prev) => prev.map((r) => r.id === editing.id ? updated : r));
            } else {
                const created = await cfgIndexesService.create(formData as CfgIndexCreateRequest);
                setData((prev) => [created, ...prev]);
            }
            setModalOpen(false);
            setEditing(null);
        } catch (err: unknown) {
            setModalError((err as { message?: string })?.message ?? "Erro ao salvar. Tente novamente.");
        }
    };

    const handleDelete = async (row: CfgIndex) => {
        try {
            await cfgIndexesService.delete(row.id);
            setData((prev) => prev.filter((r) => r.id !== row.id));
        } catch { /* keep data */ }
    };

    return (
        <ConfigLayout activeTab="indexes" theme={theme}>
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
                title="Índices do banco de dados"
                subtitle="B-Tree, Hash, GIN, GiST e BRIN — performance de consultas"
                newLabel="+ Novo índice"
                onNew={() => { setEditing(null); setModalError(""); setModalOpen(true); }}
                onEdit={(row) => { setEditing(row); setModalError(""); setModalOpen(true); }}
                onDelete={handleDelete}
                searchPlaceholder="Buscar por nome ou tabela..."
            />
            <CrudModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditing(null); setModalError(""); }}
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
