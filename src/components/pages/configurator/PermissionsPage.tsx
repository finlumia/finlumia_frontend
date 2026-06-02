"use client";

import React, { useState } from "react";
import { DataTable, type ColumnDef } from "../../organisms/DataTable";
import { CrudModal } from "../../organisms/CrudModal";
import { ConfigLayout, BoolBadge } from "./_shared";
import { MOCK_PERMISSIONS, type PermissionRecord, type UserRole } from "../../../config/configurator";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { useTheme } from "../../../shared/styles/theme.context";

const ROLE_COLORS: Record<UserRole, string> = {
    admin: "#D55E00", gerente: "#0072B2", analista: "#009E73", viewer: "#9DAAB8",
};

export function PermissionsPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);

    const [data, setData] = useState<PermissionRecord[]>(MOCK_PERMISSIONS);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<PermissionRecord | null>(null);
    const [roleFilter, setRoleFilter] = useState("all");
    const [moduleFilter, setModuleFilter] = useState("all");

    const modules = [...new Set(data.map((d) => d.module))];
    const filtered = data.filter((d) =>
        (roleFilter === "all" || d.role === roleFilter) &&
        (moduleFilter === "all" || d.module === moduleFilter)
    );

    const columns: ColumnDef<PermissionRecord>[] = [
        {
            key: "module", label: "Módulo", sortable: true,
            render: (row) => <span style={{ fontWeight: 600, color: f.colors.text.primary }}>{row.module}</span>,
        },
        { key: "subsystem", label: "Subsistema", sortable: true },
        {
            key: "role", label: "Função", sortable: true,
            render: (row) => {
                const color = ROLE_COLORS[row.role];
                return (
                    <span style={{ padding: "0.2rem 0.7rem", borderRadius: "999px", fontSize: "1.1rem", fontWeight: 600, textTransform: "uppercase", color, backgroundColor: `${color}18`, border: `1px solid ${color}40` }}>
                        {row.role}
                    </span>
                );
            },
        },
        { key: "canRead",   label: "Leitura",   align: "center", render: (row) => <BoolBadge value={row.canRead}   f={f} /> },
        { key: "canWrite",  label: "Escrita",   align: "center", render: (row) => <BoolBadge value={row.canWrite}  f={f} /> },
        { key: "canDelete", label: "Exclusão",  align: "center", render: (row) => <BoolBadge value={row.canDelete} f={f} /> },
        { key: "canAdmin",  label: "Admin",     align: "center", render: (row) => <BoolBadge value={row.canAdmin}  f={f} /> },
    ];

    const border = f.colors.border.default;
    const isDark = theme === "dark";
    const surface = isDark ? f.colors.bg.elevated : "#fff";

    const selectStyle: React.CSSProperties = {
        height: "3.6rem", padding: "0 1.2rem", borderRadius: "0.8rem",
        border: `1px solid ${border}`, backgroundColor: surface,
        color: f.colors.text.primary, fontSize: "1.3rem",
        fontFamily: f.typography.fontFamily.base, cursor: "pointer", outline: "none",
    };

    const filters = (
        <>
            <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} style={selectStyle}>
                <option value="all">Todos os módulos</option>
                {modules.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={selectStyle}>
                <option value="all">Todas as funções</option>
                {(["admin","gerente","analista","viewer"] as UserRole[]).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
        </>
    );

    const formFields = [
        { key: "module",     label: "Módulo",    type: "select" as const, required: true,
          options: modules.map((m) => ({ value: m, label: m })) },
        { key: "subsystem",  label: "Subsistema", type: "text" as const, required: true, placeholder: "Ex: Lançamentos" },
        { key: "role",       label: "Função",    type: "badge-select" as const, required: true,
          options: [{ value: "admin", label: "Admin" }, { value: "gerente", label: "Gerente" }, { value: "analista", label: "Analista" }, { value: "viewer", label: "Viewer" }],
          badgeColor: (v: string) => ROLE_COLORS[v as UserRole] ?? f.colors.text.muted },
        { key: "canRead",   label: "Permite leitura",  type: "toggle" as const },
        { key: "canWrite",  label: "Permite escrita",  type: "toggle" as const },
        { key: "canDelete", label: "Permite exclusão", type: "toggle" as const },
        { key: "canAdmin",  label: "Acesso administrativo", type: "toggle" as const, hint: "Apenas para admins" },
    ];

    const handleSave = (formData: Record<string, unknown>) => {
        if (editing) {
            setData((prev) => prev.map((r) => r.id === editing.id ? { ...r, ...formData } as PermissionRecord : r));
        } else {
            setData((prev) => [{ ...formData, id: String(Date.now()) } as PermissionRecord, ...prev]);
        }
        setEditing(null);
    };

    return (
        <ConfigLayout activeTab="permissions" theme={theme}>
            <DataTable
                columns={columns}
                data={filtered as unknown as Record<string, unknown>[]}
                keyField="id"
                theme={theme}
                title="Permissões de acesso"
                subtitle="Controle quais funções acessam cada módulo e subsistema"
                newLabel="+ Nova permissão"
                extraFilters={filters}
                onNew={() => { setEditing(null); setModalOpen(true); }}
                onEdit={(row) => { setEditing(row as unknown as PermissionRecord); setModalOpen(true); }}
                onDelete={(row) => setData((prev) => prev.filter((r) => r.id !== (row as unknown as PermissionRecord).id))}
                searchPlaceholder="Buscar por módulo ou subsistema..."
            />
            <CrudModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditing(null); }}
                onSave={handleSave}
                title={editing ? "Editar permissão" : "Nova permissão"}
                subtitle="Configurador — Permissões"
                fields={formFields}
                initial={editing as unknown as Record<string, unknown> ?? {}}
                isEdit={!!editing}
                theme={theme}
            />
        </ConfigLayout>
    );
}
