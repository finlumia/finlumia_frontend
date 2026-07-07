"use client";

import React, { useState } from "react";
import { DataTable, type ColumnDef } from "../../organisms/DataTable";
import { CrudModal } from "../../organisms/CrudModal";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { useTheme } from "../../../shared/styles/theme.context";
import { useFinance, type PayMethod } from "../../../shared/finance/finance.context";
import { TypeBadge, DeleteAction } from "./_catalogShared";

export function PaymentMethodsPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const { paymentMethods, addPaymentMethod, removePaymentMethod } = useFinance();
    const [modalOpen, setModalOpen] = useState(false);

    const columns: ColumnDef<PayMethod>[] = [
        {
            key: "label", label: "Forma de pagamento", sortable: true,
            render: (row) => <span style={{ color: f.colors.text.primary, fontWeight: 600 }}>{row.label}</span>,
        },
        { key: "id", label: "Identificador", render: (row) => <code style={{ fontSize: "1.1rem", color: f.colors.text.muted }}>{row.id}</code> },
        { key: "isDefault", label: "Tipo", render: (row) => <TypeBadge isDefault={row.isDefault} f={f} /> },
        {
            key: "acoes", label: "Ações", align: "right",
            render: (row) => <DeleteAction isDefault={row.isDefault} f={f} theme={theme} onDelete={() => removePaymentMethod(row.id)} label={`Excluir ${row.label}`} itemName={row.label} />,
        },
    ];

    return (
        <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, maxWidth: "110rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <p style={{ fontSize: "1.2rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: f.colors.text.muted, marginBottom: "0.4rem" }}>
                    Movimentações
                </p>
                <h1 style={{ fontSize: "2.8rem", fontWeight: 700, color: f.colors.text.primary }}>Formas de pagamento</h1>
                <p style={{ fontSize: "1.4rem", color: f.colors.text.muted, marginTop: "0.4rem" }}>
                    Métodos disponíveis nos lançamentos. Adicione os seus conforme a necessidade.
                </p>
            </div>

            <DataTable
                columns={columns}
                data={paymentMethods}
                keyField="id"
                theme={theme}
                newLabel="+ Nova forma"
                onNew={() => setModalOpen(true)}
                searchPlaceholder="Buscar forma de pagamento..."
                searchFields={["label", "id"]}
            />

            <CrudModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={(data) => addPaymentMethod({ label: String(data.label ?? "") })}
                title="Nova forma de pagamento"
                subtitle="Movimentações — Formas de pagamento"
                fields={[
                    { key: "label", label: "Nome da forma de pagamento", type: "text", required: true, placeholder: "Ex.: Vale-refeição", span: "full" },
                ]}
                theme={theme}
            />
        </div>
    );
}
