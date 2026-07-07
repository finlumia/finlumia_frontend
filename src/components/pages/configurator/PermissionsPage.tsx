"use client";

import React, { useCallback, useEffect, useState } from "react";
import { DataTable, type ColumnDef } from "../../organisms/DataTable";
import { CrudModal } from "../../organisms/CrudModal";
import { ConfigLayout, BoolBadge } from "./_shared";
import { cfgPermissionsService } from "../../../services/configurator/configurator.service";
import type { Permission, PermissionCreateRequest, UserRole } from "../../../api/types";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { useTheme } from "../../../shared/styles/theme.context";

const ROLE_COLORS: Record<UserRole, string> = {
    admin: "#D55E00", gerente: "#0072B2", analista: "#009E73", viewer: "#9DAAB8",
};

export function PermissionsPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const [data, setData] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Permission | null>(null);
    const [roleFilter, setRoleFilter] = useState("all");
    const [moduleFilter, setModuleFilter] = useState("all");
    const [modalError, setModalError] = useState("");

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await cfgPermissionsService.list();
            setData(res.data);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const modules = [...new Set(data.map((d) => d.module))];
    const filtered = data.filter((d) =>
        (roleFilter === "all" || d.role === roleFilter) &&
        (moduleFilter === "all" || d.module === moduleFilter)
    );

    const columns: ColumnDef<Permission>[] = [
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
        { key: "canRead",   label: "Leitura",  align: "center", render: (row) => <BoolBadge value={row.canRead}   f={f} /> },
        { key: "canWrite",  label: "Escrita",  align: "center", render: (row) => <BoolBadge value={row.canWrite}  f={f} /> },
        { key: "canDelete", label: "Exclusão", align: "center", render: (row) => <BoolBadge value={row.canDelete} f={f} /> },
        { key: "canAdmin",  label: "Admin",    align: "center", render: (row) => <BoolBadge value={row.canAdmin}  f={f} /> },
    ];

    const border = f.colors.border.default;
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
          options: modules.length > 0
            ? modules.map((m) => ({ value: m, label: m }))
            : [{ value: "", label: "Carregando..." }] },
        { key: "subsystem",  label: "Subsistema", type: "text" as const, required: true, placeholder: "Ex: Lançamentos" },
        { key: "role",       label: "Função",    type: "badge-select" as const, required: true,
          options: [{ value: "admin", label: "Admin" }, { value: "gerente", label: "Gerente" }, { value: "analista", label: "Analista" }, { value: "viewer", label: "Viewer" }],
          badgeColor: (v: string) => ROLE_COLORS[v as UserRole] ?? f.colors.text.muted },
        { key: "canRead",   label: "Permite leitura",         type: "toggle" as const },
        { key: "canWrite",  label: "Permite escrita",         type: "toggle" as const },
        { key: "canDelete", label: "Permite exclusão",        type: "toggle" as const },
        { key: "canAdmin",  label: "Acesso administrativo",   type: "toggle" as const, hint: "Apenas para admins" },
    ];

    const handleSave = async (formData: Record<string, unknown>) => {
        setModalError("");
        try {
            if (editing) {
                const updated = await cfgPermissionsService.update(editing.id, formData as Partial<PermissionCreateRequest>);
                setData((prev) => prev.map((r) => r.id === editing.id ? updated : r));
            } else {
                const created = await cfgPermissionsService.create(formData as PermissionCreateRequest);
                setData((prev) => [created, ...prev]);
            }
            setModalOpen(false);
            setEditing(null);
        } catch (err: unknown) {
            setModalError((err as { message?: string })?.message ?? "Erro ao salvar. Tente novamente.");
        }
    };

    const handleDelete = async (row: Permission) => {
        try {
            await cfgPermissionsService.delete(row.id);
            setData((prev) => prev.filter((r) => r.id !== row.id));
        } catch { /* keep data */ }
    };

    return (
        <ConfigLayout activeTab="permissions" theme={theme}>
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
                title="Permissões de acesso"
                subtitle="Controle quais funções acessam cada módulo e subsistema"
                newLabel="+ Nova permissão"
                extraFilters={filters}
                onNew={() => { setEditing(null); setModalError(""); setModalOpen(true); }}
                onEdit={(row) => { setEditing(row); setModalError(""); setModalOpen(true); }}
                onDelete={handleDelete}
                searchPlaceholder="Buscar por módulo ou subsistema..."
            />
            <CrudModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditing(null); setModalError(""); }}
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
