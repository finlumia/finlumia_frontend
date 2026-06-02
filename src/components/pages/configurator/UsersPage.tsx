"use client";

import React, { useState } from "react";
import { DataTable, type ColumnDef } from "../../organisms/DataTable";
import { CrudModal } from "../../organisms/CrudModal";
import { ConfigLayout, StatusBadge, BoolBadge } from "./_shared";
import { MOCK_USERS, type UserRecord, type UserRole } from "../../../config/configurator";
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

    const [data, setData] = useState<UserRecord[]>(MOCK_USERS);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<UserRecord | null>(null);

    const columns: ColumnDef<UserRecord>[] = [
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
                        {row.name.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: f.colors.text.primary }}>{row.name}</div>
                        <div style={{ fontSize: "1.1rem", color: f.colors.text.muted }}>{row.email}</div>
                    </div>
                </div>
            ),
        },
        { key: "role", label: "Função", sortable: true, render: (row) => <RoleBadge role={row.role} /> },
        { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} f={f} isDark={isDark} /> },
        { key: "mfa", label: "MFA", align: "center", render: (row) => <BoolBadge value={row.mfa} f={f} /> },
        { key: "lastLogin", label: "Último acesso", sortable: true, render: (row) => (
            <span style={{ color: row.lastLogin === "—" ? f.colors.text.muted : f.colors.text.secondary }}>{row.lastLogin}</span>
        )},
        { key: "createdAt", label: "Criado em", sortable: true },
    ];

    const formFields = [
        { key: "name",     label: "Nome completo", type: "text" as const,  required: true, placeholder: "Ex: João Silva" },
        { key: "email",    label: "E-mail",         type: "email" as const, required: true, placeholder: "joao@empresa.com" },
        { key: "role",     label: "Função",         type: "badge-select" as const, required: true,
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

    const handleSave = (formData: Record<string, unknown>) => {
        if (editing) {
            setData((prev) => prev.map((r) => r.id === editing.id ? { ...r, ...formData } as UserRecord : r));
        } else {
            setData((prev) => [{ ...formData, id: String(Date.now()), lastLogin: "—", createdAt: new Date().toISOString().slice(0, 10) } as UserRecord, ...prev]);
        }
        setEditing(null);
    };

    return (
        <ConfigLayout activeTab="users" theme={theme}>
            <DataTable
                columns={columns}
                data={data}
                keyField="id"
                theme={theme}
                title="Gerenciamento de usuários"
                subtitle="Cadastre e gerencie os usuários da plataforma"
                newLabel="+ Novo usuário"
                onNew={() => { setEditing(null); setModalOpen(true); }}
                onEdit={(row) => { setEditing(row); setModalOpen(true); }}
                onDelete={(row) => setData((prev) => prev.filter((r) => r.id !== row.id))}
                searchPlaceholder="Buscar por nome ou e-mail..."
            />
            <CrudModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditing(null); }}
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
