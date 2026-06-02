"use client";

import React, { useState } from "react";
import { DataTable, type ColumnDef } from "../../organisms/DataTable";
import { CrudModal } from "../../organisms/CrudModal";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { useTheme } from "../../../shared/styles/theme.context";
import { useFinance, type Bank } from "../../../shared/finance/finance.context";
import { TypeBadge, DeleteAction } from "./_catalogShared";

export function BanksPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const { banks, addBank, removeBank } = useFinance();
    const [modalOpen, setModalOpen] = useState(false);

    const columns: ColumnDef<Bank>[] = [
        {
            key: "label", label: "Banco", sortable: true,
            render: (row) => (
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    <span style={{
                        width: "3rem", height: "3rem", borderRadius: "0.6rem",
                        backgroundColor: row.color, color: "#fff", fontSize: "1rem", fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                        {row.abbr}
                    </span>
                    <span style={{ color: f.colors.text.primary, fontWeight: 600 }}>{row.label}</span>
                </div>
            ),
        },
        { key: "abbr", label: "Sigla", sortable: true },
        { key: "isDefault", label: "Tipo", render: (row) => <TypeBadge isDefault={row.isDefault} f={f} /> },
        {
            key: "acoes", label: "Ações", align: "right",
            render: (row) => <DeleteAction isDefault={row.isDefault} f={f} onDelete={() => removeBank(row.id)} label={`Excluir ${row.label}`} />,
        },
    ];

    return (
        <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, maxWidth: "110rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <p style={{ fontSize: "1.2rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: f.colors.text.muted, marginBottom: "0.4rem" }}>
                    Movimentações
                </p>
                <h1 style={{ fontSize: "2.8rem", fontWeight: 700, color: f.colors.text.primary }}>Bancos</h1>
                <p style={{ fontSize: "1.4rem", color: f.colors.text.muted, marginTop: "0.4rem" }}>
                    Instituições financeiras disponíveis nos lançamentos. Adicione as suas conforme a necessidade.
                </p>
            </div>

            <DataTable
                columns={columns}
                data={banks}
                keyField="id"
                theme={theme}
                newLabel="+ Novo banco"
                onNew={() => setModalOpen(true)}
                searchPlaceholder="Buscar banco..."
                searchFields={["label", "abbr"]}
            />

            <CrudModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={(data) => {
                    addBank({
                        label: String(data.label ?? ""),
                        abbr: String(data.abbr ?? ""),
                        color: String(data.color || "#0F766E"),
                    });
                }}
                title="Novo banco"
                subtitle="Movimentações — Bancos"
                fields={[
                    { key: "label", label: "Nome do banco", type: "text", required: true, placeholder: "Ex.: Banco Original" },
                    { key: "abbr", label: "Sigla", type: "text", required: true, placeholder: "Ex.: Or", hint: "2 a 4 caracteres" },
                    { key: "color", label: "Cor (hex)", type: "text", placeholder: "#0F766E", hint: "Formato #RRGGBB", span: "full" },
                ]}
                theme={theme}
            />
        </div>
    );
}
