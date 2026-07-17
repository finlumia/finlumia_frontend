"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ThemeMode } from "../../shared/styles/theme.types";
import { Header } from "../organisms/Header";
import { HeroSection } from "../organisms/HeroSection";
import type { TextStyleConfig } from "../atoms/text";
import type { ButtonStyleConfig } from "../atoms/button";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { useTheme } from "../../shared/styles/theme.context";
import styles from "./LandingPage.module.css";

const finlumiaIcon = "/assets/icone_finlumia.svg";
const heroImage = "/assets/image_landing_page_compress.png";
const QUESTIONNAIRE_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfNxiHab95WE42ZEkaOh-Y78xrEgyMw-kWXEr8kQ3OKAzCJlw/viewform?usp=dialog";

function scrollToId(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openExternal(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Landing page — projeto acadêmico de IHM.
 *
 * Foco em clareza, confiança e demonstração da ferramenta, não em conversão.
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
        fontWeight: "600",
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

    const indicators = [
        "Gratuita para fins acadêmicos",
        "Sem anúncios",
        "Dados privados",
        "Interface intuitiva",
    ];

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
                            props: { label: "Recursos", styleConfig: navTextStyle, theme, onClick: () => scrollToId("recursos") },
                        },
                        {
                            type: "text",
                            props: { label: "Como funciona", styleConfig: navTextStyle, theme, onClick: () => scrollToId("como-funciona") },
                        },
                        {
                            type: "text",
                            props: { label: "Perguntas", styleConfig: navTextStyle, theme, onClick: () => scrollToId("faq") },
                        },
                        {
                            type: "text",
                            props: {
                                label: "Responder questionário",
                                styleConfig: { ...navTextStyle, textColor: foundation.colors.brand.primary },
                                theme,
                                onClick: () => openExternal(QUESTIONNAIRE_URL),
                            },
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
                                label: "Acessar ferramenta",
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
                    badgeText="PROJETO ACADÊMICO · IHM"
                    title="Entenda seu dinheiro. Organize sua vida."
                    highlightTitle="Decida com confiança."
                    description="A Finlumia transforma transações financeiras em informações claras, ajudando você a entender seus hábitos, acompanhar sua evolução e tomar decisões melhores."
                    previewImage={{
                        src: heroImage,
                        alt: "Painel financeiro da Finlumia exibido em um notebook e em um smartphone, com gráficos de evolução de saldo e gastos por categoria",
                        isSvg: false,
                        className: styles.heroImage,
                        styleConfig: { objectFit: "contain" },
                    }}
                    primaryAction={{
                        label: "Acessar ferramenta",
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
                        label: "Conhecer recursos",
                        theme,
                        variant: "outlined",
                        size: "md",
                        onClick: () => scrollToId("recursos"),
                        styleConfig: {
                            ...ghostButtonStyle,
                            display: "inline-flex",
                            height: "var(--button-height)",
                        },
                    }}
                    belowActions={
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem 1.6rem", marginTop: "0.4rem" }}>
                            {indicators.map((label) => (
                                <span
                                    key={label}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        fontSize: "0.95rem",
                                        color: foundation.colors.text.secondary,
                                    }}
                                >
                                    <CheckGlyph color={foundation.colors.brand.primary} />
                                    {label}
                                </span>
                            ))}
                        </div>
                    }
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

function CheckGlyph({ color }: { color: string }) {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" opacity="0.15" fill={color} stroke="none" />
            <path d="m8 12 3 3 6-6" />
        </svg>
    );
}

// ── Scroll reveal ────────────────────────────────────────────────────────────

function Reveal({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.15 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const classNames = [styles.reveal, visible ? styles.visible : "", className ?? ""].filter(Boolean).join(" ");
    return <div ref={ref} className={classNames} style={style}>{children}</div>;
}

// ── Seções da landing (conteúdo, não venda) ─────────────────────────────────

type SectionProps = { theme: ThemeMode };

const ICON = {
    eye: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" /><circle cx="12" cy="12" r="3" />
        </svg>
    ),
    brain: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5a3 3 0 1 0-5.997.142 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
            <path d="M12 5a3 3 0 1 1 5.997.142 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
        </svg>
    ),
    target: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
        </svg>
    ),
    bolt: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
        </svg>
    ),
    checkCircle: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
        </svg>
    ),
    grid: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
    ),
    fileText: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h6" />
        </svg>
    ),
    flag: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 3v18" /><path d="M4 4h13l-3 4 3 4H4" />
        </svg>
    ),
    tag: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.42 0l8.58-8.58a1 1 0 0 0 0-1.42Z" /><circle cx="7" cy="7" r="1.5" />
        </svg>
    ),
    activity: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    ),
    sliders: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" /><circle cx="9" cy="6" r="2" />
            <line x1="4" y1="12" x2="20" y2="12" /><circle cx="15" cy="12" r="2" />
            <line x1="4" y1="18" x2="20" y2="18" /><circle cx="8" cy="18" r="2" />
        </svg>
    ),
    download: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 21h16" />
        </svg>
    ),
    clock: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
    ),
    arrowRight: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
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
    const iconBg = isDark ? `${primary}22` : f.colors.feedback.infoBg;

    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const discoveries = [
        { icon: ICON.eye, title: "Veja para onde seu dinheiro realmente vai", desc: "Todas as suas transações organizadas em um único painel, sem planilhas soltas." },
        { icon: ICON.brain, title: "Descubra hábitos de consumo", desc: "Identifique padrões recorrentes nos seus gastos e entenda o que influencia suas decisões." },
        { icon: ICON.target, title: "Acompanhe sua evolução", desc: "Compare períodos e visualize como sua situação financeira muda ao longo do tempo." },
        { icon: ICON.bolt, title: "Organize objetivos financeiros", desc: "Defina metas claras e acompanhe o progresso de cada uma em tempo real." },
    ];

    const steps = [
        { n: "01", title: "Cadastre-se", desc: "Crie sua conta em menos de um minuto, sem burocracia." },
        { n: "02", title: "Adicione algumas transações", desc: "Registre manualmente ou importe um extrato para começar." },
        { n: "03", title: "Visualize gráficos automáticos", desc: "A plataforma organiza tudo em painéis e gráficos claros." },
        { n: "04", title: "Descubra padrões financeiros", desc: "Entenda hábitos e tendências que passariam despercebidos." },
    ];

    const explore = [
        { icon: ICON.grid, label: "Dashboard" },
        { icon: ICON.fileText, label: "Relatórios" },
        { icon: ICON.flag, label: "Metas" },
        { icon: ICON.tag, label: "Categorias" },
        { icon: ICON.activity, label: "Indicadores" },
        { icon: ICON.sliders, label: "Filtros" },
        { icon: ICON.download, label: "Exportação" },
        { icon: ICON.clock, label: "Histórico" },
    ];

    const results = [
        "Maior consciência financeira",
        "Melhor organização",
        "Visualização intuitiva",
        "Compreensão dos gastos",
        "Tomada de decisão baseada em dados",
        "Planejamento mais eficiente",
    ];

    const demoBullets = [
        "Dashboard moderno",
        "Gráficos interativos",
        "Categorias automáticas",
        "Indicadores",
        "Filtros inteligentes",
    ];

    const faqs = [
        { q: "A ferramenta é gratuita?", a: "Sim. Este é um projeto acadêmico, sem custos e sem cobrança — criado para fins de aprendizado e demonstração." },
        { q: "Preciso conectar meu banco?", a: "Não. Você registra suas transações manualmente ou por importação de extrato, sem integração bancária." },
        { q: "Posso cadastrar transações manualmente?", a: "Sim — essa é a forma principal de uso: adicione receitas e despesas em poucos cliques." },
        { q: "Os dados ficam armazenados?", a: "Sim, de forma segura, apenas para o funcionamento da ferramenta durante o projeto." },
        { q: "Qual o objetivo da plataforma?", a: "Demonstrar, na prática, conceitos de Interação Humano-Computador aplicados a um produto de finanças pessoais — clareza, simplicidade e visualização de dados." },
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

    const centeredHead: React.CSSProperties = { textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" };

    const card: React.CSSProperties = {
        backgroundColor: surface,
        border: `1px solid ${border}`,
        borderRadius: "1.2rem",
        padding: "1.8rem",
    };

    const iconBadge: React.CSSProperties = {
        width: "4rem", height: "4rem", borderRadius: "1rem",
        backgroundColor: iconBg, color: primary,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "1.2rem",
    };

    return (
        <div style={{ fontFamily: f.typography.fontFamily.base }}>

            {/* ── O que você consegue descobrir ────────────────────── */}
            <section id="recursos" style={{ ...sectionWrap, borderTop: `1px solid ${border}` }}>
                <Reveal>
                    <div style={centeredHead}>
                        <span style={eyebrow}>Clareza financeira</span>
                        <h2 style={heading}>O que você consegue descobrir</h2>
                        <p style={{ ...subheading, textAlign: "center" }}>
                            Ferramentas simples para enxergar sua vida financeira com mais nitidez — sem jargões, sem complicação.
                        </p>
                    </div>
                </Reveal>

                <div className={styles.discoverGrid} style={{ marginTop: "3rem" }}>
                    {discoveries.map((item, i) => (
                        <Reveal key={item.title} style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}>
                            <div style={card} className={styles.cardHover}>
                                <div style={iconBadge}>{item.icon}</div>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.6rem" }}>{item.title}</h3>
                                <p style={{ fontSize: "1rem", color: muted, lineHeight: 1.55 }}>{item.desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ── Como funciona ─────────────────────────────────────── */}
            <section id="como-funciona" style={{ backgroundColor: isDark ? `${f.colors.bg.surface}66` : "rgba(255,255,255,0.5)", borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
                <div style={sectionWrap}>
                    <Reveal>
                        <div style={centeredHead}>
                            <span style={eyebrow}>Simples de usar</span>
                            <h2 style={heading}>Comece em poucos minutos</h2>
                            <p style={{ ...subheading, textAlign: "center" }}>Quatro passos entre criar sua conta e visualizar sua primeira análise.</p>
                        </div>
                    </Reveal>

                    <div className={styles.stepRow} style={{ marginTop: "3rem" }}>
                        {steps.map((step, i) => (
                            <React.Fragment key={step.n}>
                                <Reveal style={{ flex: 1 }}>
                                    <div style={card} className={styles.cardHover}>
                                        <div style={{
                                            width: "3.2rem", height: "3.2rem", borderRadius: "50%",
                                            backgroundColor: primary, color: "#fff",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem",
                                        }}>
                                            {i + 1}
                                        </div>
                                        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.5rem" }}>{step.title}</h3>
                                        <p style={{ fontSize: "0.98rem", color: muted, lineHeight: 1.5 }}>{step.desc}</p>
                                    </div>
                                </Reveal>
                                {i < steps.length - 1 && (
                                    <div className={styles.stepConnector} style={{ color: primary }}>{ICON.arrowRight}</div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── O que você encontrará ─────────────────────────────── */}
            <section style={sectionWrap}>
                <Reveal>
                    <div style={centeredHead}>
                        <span style={eyebrow}>Explore a plataforma</span>
                        <h2 style={heading}>O que você encontrará</h2>
                    </div>
                </Reveal>

                <div className={styles.exploreGrid} style={{ marginTop: "2.8rem" }}>
                    {explore.map((item, i) => (
                        <Reveal key={item.label} style={{ "--reveal-delay": `${i * 50}ms` } as React.CSSProperties}>
                            <div style={{ ...card, textAlign: "center", padding: "1.6rem 1rem" }} className={styles.cardHover}>
                                <div style={{ ...iconBadge, width: "3.2rem", height: "3.2rem", borderRadius: "0.8rem", margin: "0 auto 0.8rem" }}>
                                    {item.icon}
                                </div>
                                <span style={{ fontSize: "1rem", fontWeight: 600, color: f.colors.text.primary }}>{item.label}</span>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ── Resultados (qualitativos) ─────────────────────────── */}
            <section style={{ backgroundColor: isDark ? `${f.colors.bg.surface}66` : "rgba(255,255,255,0.5)", borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
                <div style={sectionWrap}>
                    <Reveal>
                        <div style={centeredHead}>
                            <span style={eyebrow}>Benefícios</span>
                            <h2 style={heading}>Resultados que você percebe no dia a dia</h2>
                        </div>
                    </Reveal>

                    <div className={styles.resultsGrid} style={{ marginTop: "2.8rem" }}>
                        {results.map((label, i) => (
                            <Reveal key={label} style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.4rem 0" }}>
                                    <span style={{ color: primary, flexShrink: 0 }}>{ICON.checkCircle}</span>
                                    <span style={{ fontSize: "1.05rem", color: f.colors.text.primary, fontWeight: 500 }}>{label}</span>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Bloco de citação ───────────────────────────────────── */}
            <Reveal>
                <section style={{ ...sectionWrap, paddingTop: "clamp(2.4rem, 4vw, 3.6rem)", paddingBottom: "clamp(2.4rem, 4vw, 3.6rem)" }}>
                    <div style={{
                        backgroundColor: primary, borderRadius: "1.4rem",
                        padding: "clamp(2rem, 4vw, 3.2rem)", display: "flex",
                        flexWrap: "wrap", gap: "2rem", alignItems: "center", justifyContent: "space-between",
                    }}>
                        <p style={{ color: "#fff", fontSize: "clamp(1.15rem, 2vw, 1.5rem)", fontWeight: 600, lineHeight: 1.4, maxWidth: "38rem", margin: 0 }}>
                            &ldquo;Quando entendemos nosso dinheiro, mudamos nossas escolhas e transformamos nosso futuro.&rdquo;
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                            {["Mais controle", "Mais tranquilidade", "Mais liberdade"].map((label) => (
                                <span key={label} style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#fff", fontSize: "1.05rem", fontWeight: 500 }}>
                                    <CheckGlyph color="#ffffff" />
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* ── Demonstração ───────────────────────────────────────── */}
            <section style={sectionWrap}>
                <div className={styles.demoGrid}>
                    <Reveal>
                        <img
                            src={heroImage}
                            alt="Interface da Finlumia exibida em um notebook"
                            className={styles.heroImage}
                            style={{ width: "100%", height: "auto", display: "block" }}
                        />
                    </Reveal>
                    <Reveal>
                        <div>
                            <span style={eyebrow}>Demonstração</span>
                            <h2 style={heading}>Veja a Finlumia em ação</h2>
                            <ul style={{ listStyle: "none", padding: 0, margin: "1.6rem 0 0", display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {demoBullets.map((label) => (
                                    <li key={label} style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                        <span style={{ color: primary, flexShrink: 0 }}>{ICON.checkCircle}</span>
                                        <span style={{ fontSize: "1.1rem", color: f.colors.text.primary, fontWeight: 500 }}>{label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── FAQ ────────────────────────────────────────────────── */}
            <section id="faq" style={sectionWrap}>
                <Reveal>
                    <div style={{ ...centeredHead, marginBottom: "3.2rem" }}>
                        <span style={eyebrow}>Ainda com dúvidas?</span>
                        <h2 style={heading}>Perguntas frequentes</h2>
                    </div>
                </Reveal>
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

            {/* ── CTA final ────────────────────────────────────────── */}
            <Reveal>
                <section style={{ ...sectionWrap, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <h2 style={{ ...heading, fontSize: "clamp(1.85rem, 3vw, 2.6rem)" }}>
                        Comece a entender melhor <span style={{ color: primary }}>seu dinheiro</span>.
                    </h2>
                    <p style={{ ...subheading, textAlign: "center" }}>
                        A Finlumia foi desenvolvida para facilitar a visualização dos seus dados financeiros e auxiliar no processo de tomada de decisão através de uma interface simples e intuitiva.
                    </p>
                    <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", justifyContent: "center", marginTop: "2.4rem" }}>
                        <button
                            type="button"
                            onClick={() => router.push("/register")}
                            className={styles.ctaButton}
                            style={{
                                backgroundColor: primary, color: "#fff", border: "none",
                                borderRadius: "0.8rem", padding: "0 2rem", height: "4.4rem",
                                fontSize: "1.05rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                            }}
                        >
                            Explorar ferramenta
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToId("recursos")}
                            className={styles.ctaButton}
                            style={{
                                backgroundColor: "transparent", color: f.colors.text.primary,
                                border: `1px solid ${border}`, borderRadius: "0.8rem",
                                padding: "0 2rem", height: "4.4rem", fontSize: "1.05rem",
                                fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                            }}
                        >
                            Conhecer recursos
                        </button>
                    </div>
                </section>
            </Reveal>

            {/* ── Footer ───────────────────────────────────────────── */}
            <footer style={{ borderTop: `1px solid ${border}`, padding: "3.2rem 1.6rem 2.4rem" }}>
                <div style={{ maxWidth: "120rem", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "1.6rem 3.2rem", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700, color: primary, letterSpacing: "0.05em" }}>FINLUMIA</div>
                    <nav style={{ display: "flex", flexWrap: "wrap", gap: "1.2rem 2rem" }}>
                        <button type="button" onClick={() => scrollToId("recursos")} style={footerLinkStyle(primary)}>Recursos</button>
                        <button type="button" onClick={() => router.push("/dashboard/support/documentation/technical")} style={footerLinkStyle(primary)}>Documentação</button>
                        <span style={footerTextStyle(muted)}>GitHub</span>
                        <span style={footerTextStyle(muted)}>Contato</span>
                        <span style={footerTextStyle(muted)}>Projeto Acadêmico</span>
                        <span style={footerTextStyle(muted)}>Política de Privacidade</span>
                    </nav>
                </div>
                <p style={{ fontSize: "0.95rem", color: muted, textAlign: "center", marginTop: "2.4rem" }}>
                    © {new Date().getFullYear()} Finlumia · Clareza financeira para decisões mais inteligentes
                </p>
            </footer>
        </div>
    );
}

function footerLinkStyle(color: string): React.CSSProperties {
    return {
        background: "none", border: "none", padding: 0, cursor: "pointer",
        fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 500, color,
    };
}

function footerTextStyle(color: string): React.CSSProperties {
    return { fontSize: "0.95rem", color };
}
