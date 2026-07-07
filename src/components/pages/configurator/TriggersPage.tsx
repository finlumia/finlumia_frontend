"use client";

import React, { useCallback, useEffect, useState } from "react";
import { DataTable, type ColumnDef } from "../../organisms/DataTable";
import { CrudModal } from "../../organisms/CrudModal";
import { ConfigLayout, StatusBadge, BoolBadge, CodeChip } from "./_shared";
import { cfgTriggersService, cfgTablesService } from "../../../services/configurator/configurator.service";
import type { CfgTrigger, CfgTriggerCreateRequest, CfgTable, TriggerEvent, TriggerTiming } from "../../../api/types";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { useTheme } from "../../../shared/styles/theme.context";

const EVENT_COLORS: Record<TriggerEvent, string> = {
    INSERT: "#009E73", UPDATE: "#0072B2", DELETE: "#D55E00", TRUNCATE: "#CC79A7",
};

const TIMING_COLORS: Record<TriggerTiming, string> = {
    BEFORE: "#E69F00", AFTER: "#0072B2", "INSTEAD OF": "#CC79A7",
};

export function TriggersPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const [data, setData] = useState<CfgTrigger[]>([]);
    const [tables, setTables] = useState<CfgTable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<CfgTrigger | null>(null);
    const [modalError, setModalError] = useState("");

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const [triggersRes, tablesRes] = await Promise.all([
                cfgTriggersService.list(),
                cfgTablesService.list(),
            ]);
            setData(triggersRes.data);
            setTables(tablesRes.data);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleToggle = async (row: CfgTrigger) => {
        try {
            const updated = await cfgTriggersService.toggle(row.id);
            setData((prev) => prev.map((r) => r.id === row.id ? updated : r));
        } catch { /* keep data */ }
    };

    function EventBadge({ event }: { event: TriggerEvent }) {
        const color = EVENT_COLORS[event];
        return <span style={{ fontFamily: "monospace", fontSize: "1.2rem", fontWeight: 700, color, backgroundColor: `${color}18`, padding: "0.2rem 0.6rem", borderRadius: "0.4rem" }}>{event}</span>;
    }

    function TimingBadge({ timing }: { timing: TriggerTiming }) {
        const color = TIMING_COLORS[timing];
        return <span style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 600, color }}>{timing}</span>;
    }

    const columns: ColumnDef<CfgTrigger>[] = [
        {
            key: "name", label: "Trigger", sortable: true,
            render: (row) => (
                <div>
                    <CodeChip value={row.name} f={f} />
                    <div style={{ fontSize: "1.1rem", color: f.colors.text.muted, marginTop: "0.2rem", maxWidth: "26rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {row.description}
                    </div>
                </div>
            ),
        },
        {
            key: "table", label: "Tabela", sortable: true,
            render: (row) => <CodeChip value={`${row.schema}.${row.table}`} f={f} />,
        },
        { key: "timing",   label: "Momento", render: (row) => <TimingBadge timing={row.timing} /> },
        { key: "event",    label: "Evento",  render: (row) => <EventBadge  event={row.event}  /> },
        {
            key: "function", label: "Função chamada",
            render: (row) => <span style={{ fontSize: "1.1rem", fontFamily: "monospace", color: f.colors.brand.primary }}>{row.function}</span>,
        },
        {
            key: "enabled", label: "Ativo", align: "center",
            render: (row) => (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleToggle(row); }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    title={row.enabled ? "Clique para desabilitar" : "Clique para habilitar"}
                >
                    <BoolBadge value={row.enabled} f={f} />
                </button>
            ),
        },
        { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} f={f} isDark={isDark} /> },
    ];

    const formFields = [
        { key: "name",     label: "Nome do trigger",    type: "text" as const, required: true, placeholder: "ex: trg_audit_users_insert" },
        { key: "tableId",  label: "Tabela alvo",         type: "select" as const, required: true,
          options: tables.map((t) => ({ value: t.id, label: t.name })) },
        { key: "schema",   label: "Schema",              type: "select" as const, required: true,
          options: ["public","auth","log","cache","billing"].map((s) => ({ value: s, label: s })) },
        { key: "timing",   label: "Momento de execução", type: "badge-select" as const, required: true,
          options: [{ value: "BEFORE", label: "BEFORE" }, { value: "AFTER", label: "AFTER" }, { value: "INSTEAD OF", label: "INSTEAD OF" }],
          badgeColor: (v: string) => TIMING_COLORS[v as TriggerTiming] ?? f.colors.text.muted },
        { key: "event",    label: "Evento disparador",   type: "badge-select" as const, required: true,
          options: [{ value: "INSERT", label: "INSERT" }, { value: "UPDATE", label: "UPDATE" }, { value: "DELETE", label: "DELETE" }, { value: "TRUNCATE", label: "TRUNCATE" }],
          badgeColor: (v: string) => EVENT_COLORS[v as TriggerEvent] ?? f.colors.text.muted },
        { key: "function", label: "Função chamada",      type: "text" as const, required: true, placeholder: "ex: log.audit_log_insert()", span: "full" as const },
        { key: "enabled",  label: "Trigger habilitado",  type: "toggle" as const },
        { key: "status",   label: "Status",              type: "badge-select" as const,
          options: [{ value: "ativo", label: "Ativo" }, { value: "inativo", label: "Inativo" }],
          badgeColor: (v: string) => v === "ativo" ? f.colors.feedback.success : f.colors.text.muted },
        { key: "description", label: "Descrição", type: "textarea" as const, placeholder: "O que este trigger faz...", span: "full" as const },
    ];

    const handleSave = async (formData: Record<string, unknown>) => {
        setModalError("");
        try {
            if (editing) {
                const updated = await cfgTriggersService.update(editing.id, formData as Partial<CfgTriggerCreateRequest>);
                setData((prev) => prev.map((r) => r.id === editing.id ? updated : r));
            } else {
                const created = await cfgTriggersService.create(formData as CfgTriggerCreateRequest);
                setData((prev) => [created, ...prev]);
            }
            setModalOpen(false);
            setEditing(null);
        } catch (err: unknown) {
            setModalError((err as { message?: string })?.message ?? "Erro ao salvar. Tente novamente.");
        }
    };

    const handleDelete = async (row: CfgTrigger) => {
        try {
            await cfgTriggersService.delete(row.id);
            setData((prev) => prev.filter((r) => r.id !== row.id));
        } catch { /* keep data */ }
    };

    return (
        <ConfigLayout activeTab="triggers" theme={theme}>
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
                title="Triggers do banco de dados"
                subtitle="Gatilhos BEFORE, AFTER e INSTEAD OF para INSERT, UPDATE, DELETE"
                newLabel="+ Novo trigger"
                onNew={() => { setEditing(null); setModalError(""); setModalOpen(true); }}
                onEdit={(row) => { setEditing(row); setModalError(""); setModalOpen(true); }}
                onDelete={handleDelete}
                searchPlaceholder="Buscar por nome ou tabela..."
            />
            <CrudModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditing(null); setModalError(""); }}
                onSave={handleSave}
                title={editing ? "Editar trigger" : "Novo trigger"}
                subtitle="Configurador — Triggers"
                fields={formFields}
                initial={editing as unknown as Record<string, unknown> ?? {}}
                isEdit={!!editing}
                theme={theme}
            />
        </ConfigLayout>
    );
}
