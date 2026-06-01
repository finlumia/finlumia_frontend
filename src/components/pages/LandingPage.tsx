"use client";

import { Header } from "../organisms/Header";
import { HeroSection } from "../organisms/HeroSection";
import type { TextStyleConfig } from "../atoms/text";
import type { ButtonStyleConfig } from "../atoms/button";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { useTheme } from "../../shared/styles/theme.context";

const finlumiaIcon = "/assets/icone_finlumia.svg";
const heroDashboard = "/assets/hero_dashboard.svg";

/**
 * Landing page entrypoint.
 *
 * Acts as reference composition for the final Header layout:
 * - left: logo
 * - center: navigation labels
 * - right: action buttons
 */
export function LandingPage() {
    const { theme } = useTheme();
    const foundation = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const textLogoStyle: TextStyleConfig = {
        backgroudColor: "transparent",
        textColor: foundation.colors.brand.primary,
        fontWeight: "700",
        fontSize: "var(--logo-font-size)",
        padding: "0",
        height: "auto",
    };

    const navTextStyle: TextStyleConfig = {
        backgroundColor: "transparent",
        textColor: foundation.colors.text.secondary,
        fontWeight: "500",
        fontSize: "var(--nav-font-size)",
        padding: "0",
        height: "auto",
        cursor: "pointer",
        display: "var(--header-nav-display)",
    };

    const ghostButtonStyle: ButtonStyleConfig = {
        display: "var(--header-secondary-action-display)",
        backgroudColor: "transparent",
        textColor: foundation.colors.brand.primary,
        border: `1px solid ${foundation.colors.border.default}`,
        borderRadius: "var(--button-radius)",
        padding: "0 var(--button-padding-inline)",
        height: "var(--button-height)",
        fontSize: "var(--button-font-size)",
    };

    const primaryButtonStyle: ButtonStyleConfig = {
        backgroudColor: foundation.colors.brand.primary,
        textColor: foundation.colors.text.inverse,
        border: `1px solid ${foundation.colors.brand.primary}`,
        borderRadius: "var(--button-radius)",
        padding: "0 var(--button-padding-inline)",
        height: "var(--button-height)",
        fontSize: "var(--button-font-size)",
        fontWeight: "700",
    };

    return (
        <main>
            <section>
                <Header
                    theme={theme}
                    styleHeader={{
                        backgroundColor: isDark ? "#051326" : foundation.colors.bg.surface,
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        padding: "var(--header-padding-y) var(--header-padding-x)",
                        gap: "var(--header-gap)",
                        centerGap: "var(--header-center-gap)",
                        rightGap: "var(--header-right-gap)",
                    }}
                    leftItems={[
                        {
                            type: "logo",
                            props: {
                                text: { label: "FINLUMIA", onClick: () => console.log("Logo principal"), styleConfig: textLogoStyle, theme },
                                icon: { src: finlumiaIcon, alt: "Logo da Finlumia", theme },
                            },
                        },
                    ]}
                    centerItems={[
                        {
                            type: "text",
                            props: { label: "Recursos", onClick: () => console.log("Recursos"), styleConfig: navTextStyle, theme },
                        },
                        {
                            type: "text",
                            props: { label: "Planos", onClick: () => console.log("Planos"), styleConfig: navTextStyle, theme },
                        },
                        {
                            type: "text",
                            props: { label: "Documentacao", onClick: () => console.log("Documentacao"), styleConfig: navTextStyle, theme },
                        },
                    ]}
                    rightItems={[
                        {
                            type: "button",
                            props: {
                                label: "Entrar",
                                theme,
                                variant: "outlined",
                                size: "md",
                                styleConfig: ghostButtonStyle,
                                onClick: () => console.log("Entrar"),
                            },
                        },
                        {
                            type: "button",
                            props: {
                                label: "Criar conta gratis",
                                theme,
                                variant: "primary",
                                size: "md",
                                styleConfig: primaryButtonStyle,
                                onClick: () => console.log("Criar conta gratis"),
                            },
                        },
                    ]}
                />
                <HeroSection
                    theme={theme}
                    badgeText="ANÁLISE FINANCEIRA PESSOAL"
                    title="Clareza financeira para decisões mais"
                    highlightTitle="inteligentes"
                    description="Centralize suas transações, identifique seus padrões de gastos e gere insights para que retome o controle total do seu patrimônio com precisão."
                    previewImage={{
                        src: heroDashboard,
                        alt: "Painel financeiro da plataforma Finlumia",
                        isSvg: true,
                    }}
                    primaryAction={{
                        label: "Comecar gratuitamente",
                        theme,
                        variant: "primary",
                        size: "lg",
                        onClick: () => console.log("Comecar gratuitamente"),
                        styleConfig: {
                            ...primaryButtonStyle,
                            padding: "0 var(--button-padding-inline)",
                        },
                    }}
                    secondaryAction={{
                        label: "Ver demonstracao",
                        theme,
                        variant: "outlined",
                        size: "lg",
                        onClick: () => console.log("Ver demonstracao"),
                        styleConfig: {
                            ...ghostButtonStyle,
                            display: "inline-flex",
                        },
                    }}
                    textStyles={{
                        badge: {
                            margin: "0 0 0.8rem 0",
                            padding: "0.35rem 0.85rem",
                            lineHeight: "1",
                            fontSize: "0.9rem",
                            letterSpacing: "0.02em",
                            width: "fit-content",
                            maxWidth: "fit-content",
                            justifyContent: "flex-start",
                            textAlign: "left",
                        },
                        title: {
                            margin: "0",
                            display: "block",
                            fontSize: "clamp(2.8rem, 4.4vw, 5.2rem)",
                            lineHeight: "1.08",
                        },
                        titleHighlight: {
                            margin: "0",
                            display: "block",
                            fontSize: "clamp(2.8rem, 4.4vw, 5.2rem)",
                            lineHeight: "1.08",
                        },
                        description: {
                            margin: "0.6rem 0 0",
                            fontSize: "clamp(1.0rem, 1.8vw, 1.6rem)",
                            textColor: foundation.colors.text.secondary,
                        },
                    }}
                />
            </section>
        </main>
    );


}