"use client";

import React, { useEffect, useState } from "react";
import { DataTable, type ColumnDef } from "../../organisms/DataTable";
import { CrudModal } from "../../organisms/CrudModal";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { useTheme } from "../../../shared/styles/theme.context";
import { useFinance, type Category } from "../../../shared/finance/finance.context";
import { resolveCategoryColor } from "../../../config/categoryPalette";
import { TypeBadge, DeleteAction } from "./_catalogShared";

export function CategoriesPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const { categories, addCategory, removeCategory, loadData } = useFinance();
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => { loadData(); }, [loadData]);

    const columns: ColumnDef<Category>[] = [
        {
            key: "label", label: "Categoria", sortable: true,
            render: (row) => (
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    <span style={{ width: "1.2rem", height: "1.2rem", borderRadius: "0.3rem", backgroundColor: resolveCategoryColor(row.id, theme, row.color).fg, flexShrink: 0 }} />
                    <span style={{ color: f.colors.text.primary, fontWeight: 600 }}>{row.label}</span>
                </div>
            ),
        },
        { key: "id", label: "Identificador", render: (row) => <code style={{ fontSize: "1.1rem", color: f.colors.text.muted }}>{row.id}</code> },
        {
            key: "appliesTo", label: "Aplica-se a",
            render: (row) => {
                const text = row.appliesTo === "receita" ? "Receitas" : row.appliesTo === "despesa" ? "Despesas" : "Receitas e despesas";
                return <span style={{ fontSize: "1.2rem", color: f.colors.text.secondary }}>{text}</span>;
            },
        },
        { key: "isDefault", label: "Tipo", render: (row) => <TypeBadge isDefault={row.isDefault} f={f} /> },
        {
            key: "acoes", label: "Ações", align: "right",
            render: (row) => <DeleteAction isDefault={row.isDefault} f={f} theme={theme} onDelete={() => removeCategory(row.id)} label={`Excluir ${row.label}`} itemName={row.label} />,
        },
    ];

    return (
        <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, maxWidth: "110rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <p style={{ fontSize: "1.2rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: f.colors.text.muted, marginBottom: "0.4rem" }}>
                    Movimentações
                </p>
                <h1 style={{ fontSize: "2.8rem", fontWeight: 700, color: f.colors.text.primary }}>Categorias</h1>
                <p style={{ fontSize: "1.4rem", color: f.colors.text.muted, marginTop: "0.4rem" }}>
                    As categorias padrão já vêm prontas. Cadastre as suas para usá-las nos lançamentos.
                </p>
            </div>

            <DataTable
                columns={columns}
                data={categories}
                keyField="id"
                theme={theme}
                newLabel="+ Nova categoria"
                onNew={() => setModalOpen(true)}
                searchPlaceholder="Buscar categoria..."
                searchFields={["label", "id"]}
            />

            <CrudModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={(data) => {
                    addCategory({
                        label: String(data.label ?? ""),
                        color: String(data.color || "#0F766E"),
                        appliesTo: (data.appliesTo as "receita" | "despesa" | "ambos") || "ambos",
                    });
                }}
                title="Nova categoria"
                subtitle="Movimentações — Categorias"
                fields={[
                    { key: "label", label: "Nome da categoria", type: "text", required: true, placeholder: "Ex.: Assinaturas", span: "full" },
                    {
                        key: "appliesTo", label: "Aplica-se a", type: "select", required: true, span: "full",
                        hint: "Ajuda a exibir só categorias relevantes ao lançar uma movimentação",
                        options: [
                            { value: "ambos", label: "Receitas e despesas" },
                            { value: "receita", label: "Somente receitas" },
                            { value: "despesa", label: "Somente despesas" },
                        ],
                    },
                    { key: "color", label: "Cor (hex)", type: "text", placeholder: "#0F766E", hint: "Formato #RRGGBB", span: "full" },
                ]}
                theme={theme}
            />
        </div>
    );
}
