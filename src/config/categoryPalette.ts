import type { ThemeMode } from "../shared/styles/theme.types";
import type { CategoryId } from "./transactions";

/**
 * Cores de categoria por tema — usa tons de Okabe-Ito / IBM (color-blind safe)
 * ajustados para atingir >=4.5:1 de contraste como texto tanto no modo claro
 * (tom escuro sobre fundo quase branco) quanto no escuro (tom claro sobre
 * fundo quase preto). O tema "colorblind" reaproveita os tons do claro, já
 * que ambos usam superfícies claras — o que muda é a escolha de matizes.
 */
const PALETTE: Record<CategoryId, { light: string; dark: string }> = {
    alimentacao: { light: "#9A5B00", dark: "#FFB84D" },   // laranja
    saude: { light: "#0072B2", dark: "#7CC6F5" },         // azul
    educacao: { light: "#5B3DE0", dark: "#B0A4F5" },      // índigo
    transporte: { light: "#A6559E", dark: "#E4A9DB" },    // púrpura-avermelhado
    lazer: { light: "#00795E", dark: "#4FD9AE" },         // verde-azulado
    moradia: { light: "#B8460E", dark: "#FF9A66" },       // vermelhão
    salario: { light: "#147A34", dark: "#7BE096" },       // verde
    vendas: { light: "#00796B", dark: "#4FBDAF" },        // ciano-esverdeado
    tecnologia: { light: "#7B3FA0", dark: "#C9A8EA" },    // violeta
    marketing: { light: "#C2185B", dark: "#F282AE" },     // magenta
    servicos: { light: "#5F6B7A", dark: "#AAB4C0" },      // cinza-ardósia
    investimento: { light: "#8A6D00", dark: "#FFD166" },  // dourado
    outros: { light: "#626B78", dark: "#C3CAD3" },        // cinza neutro
};

const FALLBACK = { light: "#5F6B7A", dark: "#AAB4C0" };

export type CategoryColors = { fg: string; bg: string; border: string };

/**
 * Resolve a cor de uma categoria para o tema atual. Categorias padrão usam a
 * paleta acima (id fixo); categorias customizadas pelo usuário mantêm a cor
 * escolhida por ele (armazenada em `fallbackColor`) tingida por transparência,
 * já que não há como saber de antemão um tom equivalente para cada tema.
 */
export function resolveCategoryColor(
    categoryId: string,
    theme: ThemeMode,
    fallbackColor?: string,
): CategoryColors {
    const entry = PALETTE[categoryId as CategoryId];
    const isDark = theme === "dark";
    const fg = entry ? (isDark ? entry.dark : entry.light) : (fallbackColor ?? (isDark ? FALLBACK.dark : FALLBACK.light));
    return { fg, bg: `${fg}20`, border: `${fg}55` };
}
