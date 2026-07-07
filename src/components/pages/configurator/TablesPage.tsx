"use client";

import React, { useCallback, useEffect, useState } from "react";
import { DataTable, type ColumnDef } from "../../organisms/DataTable";
import { CrudModal } from "../../organisms/CrudModal";
import { ConfigLayout, StatusBadge, CodeChip } from "./_shared";
import { cfgTablesService } from "../../../services/configurator/configurator.service";
import type { CfgTable, CfgTableCreateRequest } from "../../../api/types";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { useTheme } from "../../../shared/styles/theme.context";

export function TablesPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const [data, setData] = useState<CfgTable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<CfgTable | null>(null);
    const [modalError, setModalError] = useState("");

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await cfgTablesService.list();
            setData(res.data);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const columns: ColumnDef<CfgTable>[] = [
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
            render: (row) => <span style={{ fontVariantNumeric: "tabular-nums", color: f.colors.text.primary }}>{(row.rowCount ?? 0).toLocaleString("pt-BR")}</span>,
        },
        {
            key: "sizeKb", label: "Tamanho", sortable: true, align: "right",
            render: (row) => <span style={{ color: f.colors.text.secondary }}>{(row.sizeKb ?? 0) >= 1024 ? `${((row.sizeKb ?? 0) / 1024).toFixed(1)} MB` : `${row.sizeKb ?? 0} KB`}</span>,
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

    const handleSave = async (formData: Record<string, unknown>) => {
        setModalError("");
        try {
            if (editing) {
                const updated = await cfgTablesService.update(editing.id, formData as Partial<CfgTableCreateRequest>);
                setData((prev) => prev.map((r) => r.id === editing.id ? updated : r));
            } else {
                const created = await cfgTablesService.create(formData as CfgTableCreateRequest);
                setData((prev) => [created, ...prev]);
            }
            setModalOpen(false);
            setEditing(null);
        } catch (err: unknown) {
            setModalError((err as { message?: string })?.message ?? "Erro ao salvar. Tente novamente.");
        }
    };

    const handleDelete = async (row: CfgTable) => {
        try {
            await cfgTablesService.delete(row.id);
            setData((prev) => prev.filter((r) => r.id !== row.id));
        } catch {
            // keep data unchanged on error
        }
    };

    return (
        <ConfigLayout activeTab="tables" theme={theme}>
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
                title="Tabelas do banco de dados"
                subtitle="Gerencie as tabelas e seus schemas"
                newLabel="+ Nova tabela"
                onNew={() => { setEditing(null); setModalError(""); setModalOpen(true); }}
                onEdit={(row) => { setEditing(row); setModalError(""); setModalOpen(true); }}
                onDelete={handleDelete}
                searchPlaceholder="Buscar por nome ou schema..."
                searchFields={["name", "schema"] as never[]}
            />
            <CrudModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditing(null); setModalError(""); }}
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
