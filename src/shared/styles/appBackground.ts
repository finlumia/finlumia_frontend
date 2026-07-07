import type { CSSProperties } from "react";
import type { ThemeMode } from "./theme.types";
import { getFoundationByTheme } from "./tokens";

/**
 * Fundo temático financeiro (gradiente + padrão discreto de linha
 * ascendente, alusivo a gráfico de mercado) usado como base de qualquer
 * tela cheia — substitui o "fundo branco" chapado por algo com mais
 * identidade visual, mantendo baixíssima opacidade para não competir com
 * o conteúdo. O tema daltonismo (CUD) fica só com o gradiente, sem o
 * padrão, para preservar previsibilidade de contraste.
 */
function chartPattern(strokeHex: string, opacity: number): string {
    const stroke = strokeHex.replace("#", "%23");
    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cg fill='none' stroke='${stroke}' stroke-width='1' opacity='${opacity}'%3E%3Cpath d='M0 90 L20 70 L40 80 L60 40 L80 55 L100 20 L120 35'/%3E%3Ccircle cx='20' cy='70' r='2' fill='${stroke}' stroke='none'/%3E%3Ccircle cx='60' cy='40' r='2' fill='${stroke}' stroke='none'/%3E%3Ccircle cx='100' cy='20' r='2' fill='${stroke}' stroke='none'/%3E%3C/g%3E%3C/svg%3E")`;
}

export function getAppBackground(theme: ThemeMode): CSSProperties {
    const f = getFoundationByTheme(theme);

    if (theme === "dark") {
        return {
            backgroundColor: f.colors.bg.app,
            backgroundImage: `${chartPattern("#1EC6B2", 0.08)}, radial-gradient(circle at 88% 92%, rgba(30, 198, 178, 0.08), transparent 45%), linear-gradient(180deg, #0E1C20 0%, #0A1518 100%)`,
            backgroundAttachment: "fixed",
        };
    }

    if (theme === "colorblind") {
        return {
            backgroundColor: f.colors.bg.app,
            backgroundImage: "linear-gradient(180deg, #F5F8FA 0%, #EDF3F6 100%)",
            backgroundAttachment: "fixed",
        };
    }

    return {
        backgroundColor: f.colors.bg.app,
        backgroundImage: `${chartPattern("#0F766E", 0.07)}, radial-gradient(circle at 12% 8%, rgba(15, 118, 110, 0.07), transparent 42%), linear-gradient(180deg, #F4FAF8 0%, #EDF6F2 100%)`,
        backgroundAttachment: "fixed",
    };
}
