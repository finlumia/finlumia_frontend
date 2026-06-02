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

export const CATEGORIES: { id: CategoryId; label: string; color: string; bgColor: string }[] = [
    { id: "alimentacao", label: "Alimentação", color: "#E69F00", bgColor: "#2A2200" },
    { id: "saude", label: "Saúde", color: "#56B4E9", bgColor: "#0A1E35" },
    { id: "educacao", label: "Educação", color: "#0072B2", bgColor: "#001530" },
    { id: "transporte", label: "Transporte", color: "#CC79A7", bgColor: "#2A0A20" },
    { id: "lazer", label: "Lazer", color: "#009E73", bgColor: "#002A1E" },
    { id: "moradia", label: "Moradia", color: "#F0E442", bgColor: "#2A2800" },
    { id: "salario", label: "Salário", color: "#56D364", bgColor: "#0F2A1A" },
    { id: "vendas", label: "Vendas", color: "#56D364", bgColor: "#0F2A1A" },
    { id: "tecnologia", label: "Tecnologia", color: "#56B4E9", bgColor: "#0A1E35" },
    { id: "marketing", label: "Marketing", color: "#CC79A7", bgColor: "#2A0A20" },
    { id: "servicos", label: "Serviços", color: "#9DAAB8", bgColor: "#1C2430" },
    { id: "investimento", label: "Investimento", color: "#FFB74D", bgColor: "#2A1E00" },
    { id: "outros", label: "Outros", color: "#9DAAB8", bgColor: "#1C2430" },
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
