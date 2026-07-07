"use client";

import React, { useCallback, useEffect, useState } from "react";
import { DataTable, type ColumnDef } from "../../organisms/DataTable";
import { CrudModal } from "../../organisms/CrudModal";
import { ConfigLayout, StatusBadge, BoolBadge } from "./_shared";
import { cfgUsersService } from "../../../services/configurator/configurator.service";
import type { AdminUser, AdminUserCreateRequest, UserRole } from "../../../api/types";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { useTheme } from "../../../shared/styles/theme.context";

const ROLE_COLORS: Record<UserRole, string> = {
    admin:    "#D55E00",
    gerente:  "#0072B2",
    analista: "#009E73",
    viewer:   "#9DAAB8",
};

function RoleBadge({ role }: { role: UserRole }) {
    const color = ROLE_COLORS[role];
    return (
        <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "0.2rem 0.7rem", borderRadius: "999px",
            fontSize: "1.1rem", fontWeight: 600, textTransform: "uppercase",
            color, backgroundColor: `${color}18`, border: `1px solid ${color}40`,
        }}>
            {role}
        </span>
    );
}

export function UsersPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const [data, setData] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<AdminUser | null>(null);
    const [modalError, setModalError] = useState("");

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await cfgUsersService.list();
            setData(res.data);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const columns: ColumnDef<AdminUser>[] = [
        {
            key: "name", label: "Usuário", sortable: true,
            render: (row) => (
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                        width: "3.2rem", height: "3.2rem", borderRadius: "50%",
                        backgroundColor: f.colors.brand.primary, color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.3rem", fontWeight: 700, flexShrink: 0,
                    }}>
                        {row.name?.charAt(0) ?? "?"}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: f.colors.text.primary }}>{row.name ?? "—"}</div>
                        <div style={{ fontSize: "1.1rem", color: f.colors.text.muted }}>{row.email}</div>
                    </div>
                </div>
            ),
        },
        { key: "role",   label: "Função", sortable: true, render: (row) => <RoleBadge role={row.role} /> },
        { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} f={f} isDark={isDark} /> },
        { key: "mfa",    label: "MFA", align: "center", render: (row) => <BoolBadge value={row.mfa} f={f} /> },
        {
            key: "lastLogin", label: "Último acesso", sortable: true,
            render: (row) => (
                <span style={{ color: row.lastLogin ? f.colors.text.secondary : f.colors.text.muted }}>
                    {row.lastLogin ?? "—"}
                </span>
            ),
        },
        { key: "createdAt", label: "Criado em", sortable: true },
    ];

    const formFields = [
        { key: "name",   label: "Nome completo", type: "text" as const,  required: true, placeholder: "Ex: João Silva" },
        { key: "email",  label: "E-mail",         type: "email" as const, required: true, placeholder: "joao@empresa.com" },
        { key: "role",   label: "Função",          type: "badge-select" as const, required: true,
          options: [
              { value: "admin",    label: "Admin" },
              { value: "gerente",  label: "Gerente" },
              { value: "analista", label: "Analista" },
              { value: "viewer",   label: "Viewer" },
          ],
          badgeColor: (v: string) => ROLE_COLORS[v as UserRole] ?? f.colors.text.muted,
        },
        { key: "status", label: "Status", type: "badge-select" as const, required: true,
          options: [{ value: "ativo", label: "Ativo" }, { value: "inativo", label: "Inativo" }, { value: "pendente", label: "Pendente" }],
          badgeColor: (v: string) => v === "ativo" ? f.colors.feedback.success : v === "pendente" ? f.colors.feedback.warning : f.colors.text.muted,
        },
        { key: "mfa", label: "Autenticação MFA habilitada", type: "toggle" as const, hint: "Recomendado para admins" },
    ];

    const handleSave = async (formData: Record<string, unknown>) => {
        setModalError("");
        try {
            if (editing) {
                const updated = await cfgUsersService.update(editing.id, formData as Partial<AdminUserCreateRequest>);
                setData((prev) => prev.map((r) => r.id === editing.id ? updated : r));
            } else {
                const created = await cfgUsersService.create(formData as AdminUserCreateRequest);
                setData((prev) => [created, ...prev]);
            }
            setModalOpen(false);
            setEditing(null);
        } catch (err: unknown) {
            setModalError((err as { message?: string })?.message ?? "Erro ao salvar. Tente novamente.");
        }
    };

    const handleDelete = async (row: AdminUser) => {
        try {
            await cfgUsersService.delete(row.id);
            setData((prev) => prev.filter((r) => r.id !== row.id));
        } catch { /* keep data */ }
    };

    return (
        <ConfigLayout activeTab="users" theme={theme}>
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
                title="Gerenciamento de usuários"
                subtitle="Cadastre e gerencie os usuários da plataforma"
                newLabel="+ Novo usuário"
                onNew={() => { setEditing(null); setModalError(""); setModalOpen(true); }}
                onEdit={(row) => { setEditing(row); setModalError(""); setModalOpen(true); }}
                onDelete={handleDelete}
                searchPlaceholder="Buscar por nome ou e-mail..."
            />
            <CrudModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditing(null); setModalError(""); }}
                onSave={handleSave}
                title={editing ? "Editar usuário" : "Novo usuário"}
                subtitle="Configurador — Usuários"
                fields={formFields}
                initial={editing as unknown as Record<string, unknown> ?? {}}
                isEdit={!!editing}
                theme={theme}
            />
        </ConfigLayout>
    );
}
