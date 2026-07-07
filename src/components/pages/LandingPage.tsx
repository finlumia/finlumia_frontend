"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { ThemeMode } from "../../shared/styles/theme.types";
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
    const router = useRouter();
    const { theme } = useTheme();
    const foundation = getFoundationByTheme(theme);

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
        textColor: foundation.colors.text.muted,
        fontWeight: "500",
        fontSize: "var(--nav-font-size)",
        padding: "0",
        height: "auto",
        cursor: "default",
        opacity: 0.65,
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
                        backgroundColor: foundation.colors.bg.surface,
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
                                text: { label: "FINLUMIA", onClick: () => {}, styleConfig: textLogoStyle, theme },
                                icon: { src: finlumiaIcon, alt: "Logo da Finlumia", theme },
                            },
                        },
                    ]}
                    centerItems={[
                        {
                            type: "text",
                            props: { label: "Recursos", styleConfig: navTextStyle, theme },
                        },
                        {
                            type: "text",
                            props: { label: "Planos", styleConfig: navTextStyle, theme },
                        },
                        {
                            type: "text",
                            props: { label: "Documentação", styleConfig: navTextStyle, theme },
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
                                onClick: () => router.push("/login"),
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
                                onClick: () => router.push("/register"),
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
                        label: "Começar gratuitamente",
                        theme,
                        variant: "primary",
                        size: "md",
                        onClick: () => router.push("/register"),
                        styleConfig: {
                            ...primaryButtonStyle,
                            padding: "0 var(--button-padding-inline)",
                            height: "var(--button-height)",
                        },
                    }}
                    secondaryAction={{
                        label: "Ver demonstração",
                        theme,
                        variant: "outlined",
                        size: "md",
                        onClick: () => router.push("/dashboard"),
                        styleConfig: {
                            ...ghostButtonStyle,
                            display: "inline-flex",
                            height: "var(--button-height)",
                        },
                    }}
                    textStyles={{
                        badge: {
                            margin: "0 0 0.6rem 0",
                            padding: "0.3rem 0.75rem",
                            lineHeight: "1",
                            fontSize: "0.75rem",
                            letterSpacing: "0.02em",
                            width: "fit-content",
                            maxWidth: "fit-content",
                            justifyContent: "flex-start",
                            textAlign: "left",
                        },
                        title: {
                            margin: "0",
                            display: "block",
                            fontSize: "clamp(1.9rem, 3vw, 3.2rem)",
                            lineHeight: "1.12",
                        },
                        titleHighlight: {
                            margin: "0",
                            display: "block",
                            fontSize: "clamp(1.9rem, 3vw, 3.2rem)",
                            lineHeight: "1.12",
                        },
                        description: {
                            margin: "0.5rem 0 0",
                            fontSize: "clamp(0.95rem, 1.3vw, 1.15rem)",
                            lineHeight: "1.55",
                            textColor: foundation.colors.text.secondary,
                        },
                    }}
                />
            </section>

            <MarketingSections theme={theme} />
        </main>
    );
}

// ── Marketing / conversion sections ─────────────────────────────────────────

type SectionProps = { theme: ThemeMode };

const ICON = {
    radar: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" /><path d="M4 6h.01" /><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35" />
            <path d="M16.24 7.76A6 6 0 1 0 8.23 16.67" /><path d="M12 18h.01" /><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67" />
            <circle cx="12" cy="12" r="2" /><path d="m13.41 10.59 5.66-5.66" />
        </svg>
    ),
    brain: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5a3 3 0 1 0-5.997.142 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
            <path d="M12 5a3 3 0 1 1 5.997.142 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
        </svg>
    ),
    shield: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
        </svg>
    ),
    bell: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
    ),
    target: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
        </svg>
    ),
    sync: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" />
        </svg>
    ),
};

function MarketingSections({ theme }: SectionProps) {
    const router = useRouter();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const primary = f.colors.brand.primary;
    const muted = f.colors.text.muted;
    const border = f.colors.border.default;
    const surface = isDark ? f.colors.bg.surface : "#FFFFFF";

    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const features = [
        { icon: ICON.radar, title: "Gastos invisíveis, revelados", desc: "Descubra para onde seu dinheiro realmente vai. A Finlumia destaca assinaturas esquecidas e pequenos vazamentos que somam centenas por mês." },
        { icon: ICON.brain, title: "Insights inteligentes", desc: "Análises automáticas mostram padrões de consumo e sugerem onde cortar sem abrir mão do que importa para você." },
        { icon: ICON.sync, title: "Tudo em um só lugar", desc: "Centralize contas, cartões e investimentos. Chega de planilhas espalhadas e de adivinhar o saldo do mês." },
        { icon: ICON.target, title: "Metas que você cumpre", desc: "Defina objetivos e acompanhe o progresso em tempo real, com marcos visuais que mantêm sua motivação lá em cima." },
        { icon: ICON.bell, title: "Alertas no momento certo", desc: "Receba avisos antes de estourar o orçamento — e nunca mais pague juros por uma fatura esquecida." },
        { icon: ICON.shield, title: "Segurança de banco", desc: "Criptografia de ponta a ponta e privacidade por padrão. Seus dados são seus — nunca vendemos suas informações." },
    ];

    const steps = [
        { n: "01", title: "Crie sua conta grátis", desc: "Menos de 1 minuto. Sem cartão de crédito, sem letras miúdas." },
        { n: "02", title: "Registre ou importe", desc: "Adicione suas transações em segundos e veja tudo organizado automaticamente." },
        { n: "03", title: "Decida com clareza", desc: "Receba insights e relatórios visuais para tomar decisões melhores todos os dias." },
    ];

    const faqs = [
        { q: "A Finlumia é realmente gratuita?", a: "Sim. Você cria sua conta e usa os recursos essenciais sem pagar nada e sem cartão de crédito. Planos avançados são opcionais." },
        { q: "Meus dados financeiros estão seguros?", a: "Totalmente. Usamos criptografia de ponta a ponta, e nunca compartilhamos ou vendemos suas informações para terceiros." },
        { q: "Preciso conectar meu banco?", a: "Não é obrigatório. Você pode registrar manualmente ou importar extratos — você tem controle total sobre o que entra na plataforma." },
        { q: "Posso cancelar quando quiser?", a: "Sim, em 1 clique e sem burocracia. Sem fidelidade e sem perguntas." },
    ];

    const sectionWrap: React.CSSProperties = {
        maxWidth: "120rem",
        margin: "0 auto",
        padding: "clamp(3rem, 5vw, 5.5rem) clamp(1.6rem, 4vw, 3.2rem)",
    };

    const eyebrow: React.CSSProperties = {
        fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.12em",
        textTransform: "uppercase", color: primary, marginBottom: "0.6rem",
    };

    const heading: React.CSSProperties = {
        fontSize: "clamp(1.75rem, 2.6vw, 2.5rem)", fontWeight: 800,
        color: f.colors.text.primary, lineHeight: 1.15, margin: 0,
    };

    const subheading: React.CSSProperties = {
        fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)", color: muted,
        marginTop: "0.8rem", maxWidth: "56rem", lineHeight: 1.55,
    };

    const card: React.CSSProperties = {
        backgroundColor: surface,
        border: `1px solid ${border}`,
        borderRadius: "1.2rem",
        padding: "1.8rem",
    };

    return (
        <div style={{ fontFamily: f.typography.fontFamily.base }}>

            {/* ── Loss-aversion hook ───────────────────────────────── */}
            <section style={{ ...sectionWrap, borderTop: `1px solid ${border}` }}>
                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={eyebrow}>Você no controle</span>
                    <h2 style={heading}>
                        Pare de perder dinheiro com{" "}
                        <span style={{ color: primary }}>gastos invisíveis</span>
                    </h2>
                    <p style={{ ...subheading, textAlign: "center" }}>
                        A pessoa média desperdiça centenas de reais por mês sem perceber. A Finlumia transforma seus números em decisões claras — e devolve esse dinheiro para o seu bolso.
                    </p>
                </div>

                {/* Features grid */}
                <div className="grid-responsive" style={{ ["--grid-cols"]: "repeat(3, 1fr)", gap: "1.6rem", marginTop: "3rem" } as React.CSSProperties}>
                    {features.map((feat) => (
                        <div key={feat.title} style={card}>
                            <div style={{
                                width: "4rem", height: "4rem", borderRadius: "1rem",
                                backgroundColor: isDark ? `${primary}22` : f.colors.feedback.infoBg,
                                color: primary, display: "flex", alignItems: "center", justifyContent: "center",
                                marginBottom: "1.2rem",
                            }}>
                                {feat.icon}
                            </div>
                            <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.6rem" }}>{feat.title}</h3>
                            <p style={{ fontSize: "1.05rem", color: muted, lineHeight: 1.55 }}>{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How it works ─────────────────────────────────────── */}
            <section style={{ backgroundColor: isDark ? `${f.colors.bg.surface}66` : "rgba(255,255,255,0.5)", borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
                <div style={sectionWrap}>
                    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span style={eyebrow}>Simples assim</span>
                        <h2 style={heading}>Comece em 3 passos</h2>
                        <p style={{ ...subheading, textAlign: "center" }}>Sem complicação. Em minutos você já enxerga sua vida financeira com outros olhos.</p>
                    </div>
                    <div className="grid-responsive" style={{ ["--grid-cols"]: "repeat(3, 1fr)", gap: "1.6rem", marginTop: "3rem" } as React.CSSProperties}>
                        {steps.map((step) => (
                            <div key={step.n} style={{ ...card, position: "relative", overflow: "hidden" }}>
                                <div style={{ fontSize: "3.2rem", fontWeight: 800, color: `${primary}26`, lineHeight: 1, marginBottom: "0.6rem" }}>{step.n}</div>
                                <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.6rem" }}>{step.title}</h3>
                                <p style={{ fontSize: "1.05rem", color: muted, lineHeight: 1.55 }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ (objection handling / curiosity) ─────────────── */}
            <section style={sectionWrap}>
                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "3.2rem" }}>
                    <span style={eyebrow}>Ainda com dúvidas?</span>
                    <h2 style={heading}>Perguntas frequentes</h2>
                </div>
                <div style={{ maxWidth: "76rem", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {faqs.map((item, i) => {
                        const open = openFaq === i;
                        return (
                            <div key={item.q} style={{ ...card, padding: "0" }}>
                                <button
                                    type="button"
                                    onClick={() => setOpenFaq(open ? null : i)}
                                    aria-expanded={open}
                                    style={{
                                        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                                        gap: "1.2rem", padding: "1.4rem 1.8rem", background: "transparent", border: "none",
                                        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                                    }}
                                >
                                    <span style={{ fontSize: "1.15rem", fontWeight: 600, color: f.colors.text.primary }}>{item.q}</span>
                                    <span style={{ color: primary, flexShrink: 0, fontSize: "1.6rem", lineHeight: 1, transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s ease" }}>+</span>
                                </button>
                                {open && (
                                    <p style={{ fontSize: "1.05rem", color: muted, lineHeight: 1.55, padding: "0 1.8rem 1.6rem" }}>{item.a}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── Final CTA ────────────────────────────────────────── */}
            <section style={{ ...sectionWrap, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h2 style={{ ...heading, fontSize: "clamp(1.85rem, 3vw, 2.6rem)" }}>
                    Seu dinheiro merece <span style={{ color: primary }}>clareza</span>.
                </h2>
                <p style={{ ...subheading, textAlign: "center" }}>
                    Organize suas finanças, acompanhe seus gastos e tome decisões com mais segurança. Comece grátis hoje — seu eu do futuro agradece.
                </p>
                <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", justifyContent: "center", marginTop: "2.4rem" }}>
                    <button
                        type="button"
                        onClick={() => router.push("/register")}
                        style={{
                            backgroundColor: primary, color: "#fff", border: "none",
                            borderRadius: "0.8rem", padding: "0 2rem", height: "4.4rem",
                            fontSize: "1.05rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                            boxShadow: `0 10px 28px ${primary}40`,
                        }}
                    >
                        Criar conta grátis
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        style={{
                            backgroundColor: "transparent", color: f.colors.text.primary,
                            border: `1px solid ${border}`, borderRadius: "0.8rem",
                            padding: "0 2rem", height: "4.4rem", fontSize: "1.05rem",
                            fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                        }}
                    >
                        Já tenho conta
                    </button>
                </div>
                <p style={{ fontSize: "0.95rem", color: muted, marginTop: "1.2rem" }}>
                    Grátis para sempre no plano essencial · Sem cartão de crédito · Cancele quando quiser
                </p>
            </section>

            {/* ── Footer ───────────────────────────────────────────── */}
            <footer style={{ borderTop: `1px solid ${border}`, padding: "2.4rem 1.6rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: primary, letterSpacing: "0.05em", marginBottom: "0.4rem" }}>FINLUMIA</div>
                <p style={{ fontSize: "0.95rem", color: muted }}>© {new Date().getFullYear()} Finlumia · Clareza financeira para decisões mais inteligentes</p>
            </footer>
        </div>
    );
}