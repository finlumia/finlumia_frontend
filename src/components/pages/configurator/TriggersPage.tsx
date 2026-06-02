"use client";

import React, { useState } from "react";
import { DataTable, type ColumnDef } from "../../organisms/DataTable";
import { CrudModal } from "../../organisms/CrudModal";
import { ConfigLayout, StatusBadge, BoolBadge, CodeChip } from "./_shared";
import { MOCK_TRIGGERS, MOCK_TABLES, type TriggerRecord, type TriggerEvent, type TriggerTiming } from "../../../config/configurator";
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

    const [data, setData] = useState<TriggerRecord[]>(MOCK_TRIGGERS);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<TriggerRecord | null>(null);

    const tableNames = [...new Set(MOCK_TABLES.map((t) => t.name))];

    function EventBadge({ event }: { event: TriggerEvent }) {
        const color = EVENT_COLORS[event];
        return <span style={{ fontFamily: "monospace", fontSize: "1.2rem", fontWeight: 700, color, backgroundColor: `${color}18`, padding: "0.2rem 0.6rem", borderRadius: "0.4rem" }}>{event}</span>;
    }

    function TimingBadge({ timing }: { timing: TriggerTiming }) {
        const color = TIMING_COLORS[timing];
        return <span style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 600, color }}>{timing}</span>;
    }

    const columns: ColumnDef<TriggerRecord>[] = [
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
        { key: "timing", label: "Momento", render: (row) => <TimingBadge timing={row.timing} /> },
        { key: "event",  label: "Evento",  render: (row) => <EventBadge  event={row.event}  /> },
        {
            key: "function", label: "Função chamada",
            render: (row) => <span style={{ fontSize: "1.1rem", fontFamily: "monospace", color: f.colors.brand.primary }}>{row.function}</span>,
        },
        { key: "enabled", label: "Ativo",  align: "center", render: (row) => <BoolBadge value={row.enabled} f={f} /> },
        { key: "status",  label: "Status", render: (row) => <StatusBadge status={row.status} f={f} isDark={isDark} /> },
    ];

    const formFields = [
        { key: "name",     label: "Nome do trigger",   type: "text" as const, required: true, placeholder: "ex: trg_audit_users_insert" },
        { key: "table",    label: "Tabela alvo",        type: "select" as const, required: true,
          options: tableNames.map((n) => ({ value: n, label: n })) },
        { key: "schema",   label: "Schema",             type: "select" as const, required: true,
          options: ["public","auth","log","cache","billing"].map((s) => ({ value: s, label: s })) },
        { key: "timing",   label: "Momento de execução", type: "badge-select" as const, required: true,
          options: [{ value: "BEFORE", label: "BEFORE" }, { value: "AFTER", label: "AFTER" }, { value: "INSTEAD OF", label: "INSTEAD OF" }],
          badgeColor: (v: string) => TIMING_COLORS[v as TriggerTiming] ?? f.colors.text.muted },
        { key: "event",    label: "Evento disparador",  type: "badge-select" as const, required: true,
          options: [{ value: "INSERT", label: "INSERT" }, { value: "UPDATE", label: "UPDATE" }, { value: "DELETE", label: "DELETE" }, { value: "TRUNCATE", label: "TRUNCATE" }],
          badgeColor: (v: string) => EVENT_COLORS[v as TriggerEvent] ?? f.colors.text.muted },
        { key: "function", label: "Função chamada",     type: "text" as const, required: true, placeholder: "ex: log.audit_log_insert()", span: "full" as const },
        { key: "enabled",  label: "Trigger habilitado", type: "toggle" as const },
        { key: "status",   label: "Status",             type: "badge-select" as const,
          options: [{ value: "ativo", label: "Ativo" }, { value: "inativo", label: "Inativo" }],
          badgeColor: (v: string) => v === "ativo" ? f.colors.feedback.success : f.colors.text.muted },
        { key: "description", label: "Descrição", type: "textarea" as const, placeholder: "O que este trigger faz...", span: "full" as const },
    ];

    const handleSave = (formData: Record<string, unknown>) => {
        if (editing) {
            setData((prev) => prev.map((r) => r.id === editing.id ? { ...r, ...formData } as TriggerRecord : r));
        } else {
            setData((prev) => [{ ...formData, id: String(Date.now()), createdAt: new Date().toISOString().slice(0, 10) } as TriggerRecord, ...prev]);
        }
        setEditing(null);
    };

    return (
        <ConfigLayout activeTab="triggers" theme={theme}>
            <DataTable
                columns={columns}
                data={data as unknown as Record<string, unknown>[]}
                keyField="id"
                theme={theme}
                title="Triggers do banco de dados"
                subtitle="Gatilhos BEFORE, AFTER e INSTEAD OF para INSERT, UPDATE, DELETE"
                newLabel="+ Novo trigger"
                onNew={() => { setEditing(null); setModalOpen(true); }}
                onEdit={(row) => { setEditing(row as unknown as TriggerRecord); setModalOpen(true); }}
                onDelete={(row) => setData((prev) => prev.filter((r) => r.id !== (row as unknown as TriggerRecord).id))}
                searchPlaceholder="Buscar por nome ou tabela..."
            />
            <CrudModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditing(null); }}
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
