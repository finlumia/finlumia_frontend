
export type Period = "3m" | "6m" | "12m" | "ytd";

export type MonthlySummary = {
    month: string;       // "Jan", "Fev", ...
    year: number;
    receitas: number;
    despesas: number;
    saldo: number;
    patrimonio: number;
};

export type CategoryShare = {
    categoryId: string;
    label: string;
    color: string;
    bgColor: string;
    total: number;
    percent: number;
    trend: number;       // % change vs prev period
};

export type InstitutionShare = {
    id: string;
    label: string;
    color: string;
    abbr: string;
    total: number;
    percent: number;
};

export type Insight = {
    id: string;
    type: "positive" | "negative" | "neutral" | "alert";
    title: string;
    description: string;
    icon: string;
};

// 12 months of mock data
export const MONTHLY_DATA: MonthlySummary[] = [
    { month: "Jul", year: 2023, receitas: 7200, despesas: 5100, saldo: 2100, patrimonio: 18500 },
    { month: "Ago", year: 2023, receitas: 7200, despesas: 4870, saldo: 2330, patrimonio: 20830 },
    { month: "Set", year: 2023, receitas: 8100, despesas: 5420, saldo: 2680, patrimonio: 23510 },
    { month: "Out", year: 2023, receitas: 7200, despesas: 5940, saldo: 1260, patrimonio: 24770 },
    { month: "Nov", year: 2023, receitas: 9400, despesas: 6300, saldo: 3100, patrimonio: 27870 },
    { month: "Dez", year: 2023, receitas: 12800, despesas: 8900, saldo: 3900, patrimonio: 31770 },
    { month: "Jan", year: 2024, receitas: 7200, despesas: 5200, saldo: 2000, patrimonio: 33770 },
    { month: "Fev", year: 2024, receitas: 7200, despesas: 4800, saldo: 2400, patrimonio: 36170 },
    { month: "Mar", year: 2024, receitas: 8350, despesas: 5100, saldo: 3250, patrimonio: 39420 },
    { month: "Abr", year: 2024, receitas: 7200, despesas: 6200, saldo: 1000, patrimonio: 40420 },
    { month: "Mai", year: 2024, receitas: 9100, despesas: 5680, saldo: 3420, patrimonio: 43840 },
    { month: "Jun", year: 2024, receitas: 7200, despesas: 4950, saldo: 2250, patrimonio: 46090 },
];

export const CATEGORY_DATA: CategoryShare[] = [
    { categoryId: "alimentacao", label: "Alimentação", color: "#E69F00", bgColor: "#2A2200", total: 2840, percent: 22.4, trend: +8.2 },
    { categoryId: "tecnologia",  label: "Tecnologia",  color: "#56B4E9", bgColor: "#0A1E35", total: 2100, percent: 16.6, trend: -3.1 },
    { categoryId: "moradia",     label: "Moradia",     color: "#F0E442", bgColor: "#2A2800", total: 1800, percent: 14.2, trend: 0 },
    { categoryId: "transporte",  label: "Transporte",  color: "#CC79A7", bgColor: "#2A0A20", total: 1320, percent: 10.4, trend: +12.5 },
    { categoryId: "lazer",       label: "Lazer",       color: "#009E73", bgColor: "#002A1E", total: 980,  percent: 7.7,  trend: -15.3 },
    { categoryId: "saude",       label: "Saúde",       color: "#56B4E9", bgColor: "#0A1E35", total: 760,  percent: 6.0,  trend: +2.1 },
    { categoryId: "marketing",   label: "Marketing",   color: "#CC79A7", bgColor: "#2A0A20", total: 680,  percent: 5.4,  trend: +25.0 },
    { categoryId: "outros",      label: "Outros",      color: "#9DAAB8", bgColor: "#1C2430", total: 2180, percent: 17.2, trend: -5.0 },
];

export const INSTITUTION_DATA: InstitutionShare[] = [
    { id: "nubank",    label: "Nubank",         color: "#820AD1", abbr: "Nu",   total: 4200, percent: 38.2 },
    { id: "itau",      label: "Itaú",           color: "#EC7000", abbr: "Itaú", total: 2800, percent: 25.5 },
    { id: "bb",        label: "Banco do Brasil", color: "#FCDE00", abbr: "BB",   total: 1600, percent: 14.6 },
    { id: "bradesco",  label: "Bradesco",        color: "#CC092F", abbr: "Br",   total: 1200, percent: 10.9 },
    { id: "inter",     label: "Inter",           color: "#FF7A00", abbr: "In",   total: 900,  percent: 8.2 },
    { id: "picpay",    label: "PicPay",          color: "#11C76F", abbr: "Pic",  total: 280,  percent: 2.5 },
];

export const INSIGHTS: Insight[] = [
    {
        id: "1",
        type: "negative",
        title: "Transporte +12,5% este mês",
        description: "Seus gastos com transporte cresceram significativamente. Considere avaliar alternativas de deslocamento.",
        icon: "trending-up",
    },
    {
        id: "2",
        type: "positive",
        title: "Lazer: você economizou R$ 175",
        description: "Seus gastos com lazer caíram 15,3% em relação ao mês anterior. Bom trabalho!",
        icon: "trending-down",
    },
    {
        id: "3",
        type: "alert",
        title: "Marketing em alta: +25%",
        description: "Gastos com marketing subiram muito. Analise se o retorno justifica esse investimento.",
        icon: "alert",
    },
    {
        id: "4",
        type: "neutral",
        title: "Taxa de poupança: 31,3%",
        description: "Você poupou R$ 2.250 dos R$ 7.200 recebidos este mês — acima da meta recomendada de 20%.",
        icon: "piggy",
    },
    {
        id: "5",
        type: "positive",
        title: "Patrimônio cresceu R$ 12.320",
        description: "Nos últimos 6 meses seu patrimônio líquido cresceu 36,4%. Continue nessa trajetória!",
        icon: "chart",
    },
];

export function getDataForPeriod(period: Period): MonthlySummary[] {
    switch (period) {
        case "3m":  return MONTHLY_DATA.slice(-3);
        case "6m":  return MONTHLY_DATA.slice(-6);
        case "ytd": return MONTHLY_DATA.filter((d) => d.year === 2024);
        case "12m":
        default:    return MONTHLY_DATA;
    }
}

export function computeKPIs(data: MonthlySummary[]) {
    const totalReceitas = data.reduce((s, d) => s + d.receitas, 0);
    const totalDespesas = data.reduce((s, d) => s + d.despesas, 0);
    const saldoLiquido = totalReceitas - totalDespesas;
    const taxaPoupanca = totalReceitas > 0 ? (saldoLiquido / totalReceitas) * 100 : 0;
    const patrimonioAtual = data.at(-1)?.patrimonio ?? 0;
    const patrimonioInicial = data.at(0)?.patrimonio ?? 0;
    const crescimentoPatrimonio = patrimonioInicial > 0
        ? ((patrimonioAtual - patrimonioInicial) / patrimonioInicial) * 100
        : 0;

    return { totalReceitas, totalDespesas, saldoLiquido, taxaPoupanca, patrimonioAtual, crescimentoPatrimonio };
}
