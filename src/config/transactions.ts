export type TransactionType = "receita" | "despesa";

export type PaymentMethod = "credito" | "debito" | "pix" | "dinheiro" | "ted" | "doc";

export type InstitutionId =
    | "nubank" | "itau" | "bb" | "bradesco" | "santander" | "picpay" | "inter" | "c6" | "xp";

export type CategoryId =
    | "alimentacao" | "saude" | "educacao" | "transporte" | "lazer"
    | "moradia" | "salario" | "vendas" | "tecnologia" | "marketing"
    | "servicos" | "investimento" | "outros";

export type Transaction = {
    id: string;
    type: TransactionType;
    // ids widened to string so users can register custom methods/banks/categories
    method: PaymentMethod | string;
    institution: InstitutionId | string;
    date: string;        // ISO yyyy-MM-dd
    category: CategoryId | string;
    description: string;
    subDescription?: string;
    amount: number;      // positive for both; type determines sign
    notes?: string;
    isRecurring?: boolean;
    recurringId?: string;
};

export const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
    { id: "pix", label: "Pix" },
    { id: "credito", label: "Cartão de Crédito" },
    { id: "debito", label: "Cartão de Débito" },
    { id: "dinheiro", label: "Dinheiro" },
    { id: "ted", label: "TED" },
    { id: "doc", label: "DOC" },
];

export const INSTITUTIONS: { id: InstitutionId; label: string; color: string; abbr: string }[] = [
    { id: "nubank", label: "Nubank", color: "#820AD1", abbr: "Nu" },
    { id: "itau", label: "Itaú", color: "#EC7000", abbr: "Itaú" },
    { id: "bb", label: "Banco do Brasil", color: "#FCDE00", abbr: "BB" },
    { id: "bradesco", label: "Bradesco", color: "#CC092F", abbr: "Br" },
    { id: "santander", label: "Santander", color: "#EC0000", abbr: "San" },
    { id: "picpay", label: "PicPay", color: "#11C76F", abbr: "Pic" },
    { id: "inter", label: "Inter", color: "#FF7A00", abbr: "In" },
    { id: "c6", label: "C6 Bank", color: "#222222", abbr: "C6" },
    { id: "xp", label: "XP Investimentos", color: "#1B1A1C", abbr: "XP" },
];

/** Para quais tipos de lançamento a categoria é relevante — usada para filtrar
 * as opções mostradas no formulário conforme o tipo (receita/despesa)
 * selecionado, evitando categorias fora de contexto (ex.: "Salário" ao
 * lançar uma despesa). "investimento" marca categorias com tratamento visual
 * próprio (cor/ícone/animação), podendo aparecer tanto em receitas quanto
 * despesas (aporte = despesa, rendimento/resgate = receita). */
export type CategoryAppliesTo = "receita" | "despesa" | "ambos";

/** Cores "base" (tom claro/color-blind safe) usadas como valor default e
 * como fallback fora do fluxo de renderização — a maioria dos componentes
 * resolve a cor real por tema via `resolveCategoryColor` (ver categoryPalette.ts),
 * que adapta o tom para contraste adequado em claro/escuro/daltônico. */
export const CATEGORIES: { id: CategoryId; label: string; color: string; bgColor: string; appliesTo: CategoryAppliesTo }[] = [
    { id: "alimentacao", label: "Alimentação", color: "#9A5B00", bgColor: "#9A5B0020", appliesTo: "despesa" },
    { id: "saude", label: "Saúde", color: "#0072B2", bgColor: "#0072B220", appliesTo: "despesa" },
    { id: "educacao", label: "Educação", color: "#5B3DE0", bgColor: "#5B3DE020", appliesTo: "despesa" },
    { id: "transporte", label: "Transporte", color: "#A6559E", bgColor: "#A6559E20", appliesTo: "despesa" },
    { id: "lazer", label: "Lazer", color: "#00795E", bgColor: "#00795E20", appliesTo: "despesa" },
    { id: "moradia", label: "Moradia", color: "#B8460E", bgColor: "#B8460E20", appliesTo: "despesa" },
    { id: "salario", label: "Salário", color: "#147A34", bgColor: "#147A3420", appliesTo: "receita" },
    { id: "vendas", label: "Vendas", color: "#00796B", bgColor: "#00796B20", appliesTo: "receita" },
    { id: "tecnologia", label: "Tecnologia", color: "#7B3FA0", bgColor: "#7B3FA020", appliesTo: "despesa" },
    { id: "marketing", label: "Marketing", color: "#C2185B", bgColor: "#C2185B20", appliesTo: "despesa" },
    { id: "servicos", label: "Serviços", color: "#5F6B7A", bgColor: "#5F6B7A20", appliesTo: "ambos" },
    { id: "investimento", label: "Investimento", color: "#8A6D00", bgColor: "#8A6D0020", appliesTo: "ambos" },
    { id: "outros", label: "Outros", color: "#626B78", bgColor: "#626B7820", appliesTo: "ambos" },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: "1", type: "receita", method: "ted", institution: "itau", date: "2024-10-12", category: "vendas", description: "Venda Recorrente – Plano Enterprise", subDescription: "ID: #8903729406", amount: 15400.00 },
    { id: "2", type: "despesa", method: "pix", institution: "nubank", date: "2024-10-11", category: "tecnologia", description: "Cloud Infrastructure – AWS", subDescription: "Serviços Mensais", amount: 4250.80 },
    { id: "3", type: "despesa", method: "credito", institution: "bb", date: "2024-10-10", category: "marketing", description: "Campanha Google Ads", subDescription: "Marketing GA", amount: 2000.00 },
    { id: "4", type: "receita", method: "pix", institution: "nubank", date: "2024-10-09", category: "salario", description: "Salário Outubro", amount: 7200.00 },
    { id: "5", type: "despesa", method: "debito", institution: "bradesco", date: "2024-10-08", category: "alimentacao", description: "Supermercado Extra", amount: 340.50 },
    { id: "6", type: "despesa", method: "pix", institution: "inter", date: "2024-10-07", category: "lazer", description: "Streaming – Netflix + Spotify", amount: 74.90 },
    { id: "7", type: "receita", method: "ted", institution: "xp", date: "2024-10-06", category: "investimento", description: "Rendimento CDB", subDescription: "Vencimento outubro", amount: 890.00 },
];
