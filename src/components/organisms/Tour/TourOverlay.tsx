"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTour } from "../../../contexts/tour.context";
import { useTheme } from "../../../shared/styles/theme.context";
import { getFoundationByTheme } from "../../../shared/styles/tokens";

type Rect = { top: number; left: number; width: number; height: number };

const SPOTLIGHT_PAD = 10;
const TOOLTIP_W = 360;
const TOOLTIP_GAP = 24;
// Margem de segurança (px) entre o cartão do tour e a borda da viewport —
// mesma folga usada pelos cartões centralizados (calc(100vw - 3.2rem)).
const VIEWPORT_MARGIN = 32;

// ── Icons ──────────────────────────────────────────────────────────────────

const STEP_ICONS: Record<string, React.ReactNode> = {
    dashboard: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
    ),
    movimentation: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3 4 7l4 4"/><path d="M4 7h16"/>
            <path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>
        </svg>
    ),
    reports: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
        </svg>
    ),
    configurator: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7h-9"/><path d="M14 17H5"/>
            <circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>
        </svg>
    ),
    support: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
            <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/>
            <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/>
            <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/>
            <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/>
        </svg>
    ),
};

// ── Main component ─────────────────────────────────────────────────────────

export function TourOverlay() {
    const { isActive, currentStep, stepIndex, totalSteps, next, prev, skip } = useTour();
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const [mounted, setMounted] = useState(false);
    const [rect, setRect] = useState<Rect | null>(null);
    const [opacity, setOpacity] = useState(0);
    const [vh, setVh] = useState(800);
    const [vw, setVw] = useState(1280);

    useEffect(() => {
        setMounted(true);
        setVh(window.innerHeight);
        setVw(window.innerWidth);
        const onResize = () => { setVh(window.innerHeight); setVw(window.innerWidth); };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Measure spotlight target
    useEffect(() => {
        if (!isActive || !currentStep.target) { setRect(null); return; }
        const measure = () => {
            const el = document.querySelector(currentStep.target!);
            if (!el) { setRect(null); return; }
            const r = el.getBoundingClientRect();
            // Em tablet/celular o item pode existir no DOM mas estar fora da tela
            // (drawer da Sidebar fechado, off-canvas via transform) — nesse caso
            // tratamos como "sem alvo" e caímos no cartão centralizado em vez de
            // posicionar o tooltip sobre um elemento invisível.
            const onScreen = r.width > 0 && r.height > 0
                && r.right > 0 && r.left < window.innerWidth
                && r.bottom > 0 && r.top < window.innerHeight;
            if (!onScreen) { setRect(null); return; }
            setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        };
        const t = setTimeout(measure, 60);
        window.addEventListener("resize", measure);
        return () => { clearTimeout(t); window.removeEventListener("resize", measure); };
    }, [isActive, currentStep, stepIndex]);

    // Fade effect on step change
    useEffect(() => {
        if (!isActive) { setOpacity(0); return; }
        setOpacity(0);
        const t = setTimeout(() => setOpacity(1), 80);
        return () => clearTimeout(t);
    }, [isActive, stepIndex]);

    if (!mounted || !isActive) return null;

    const primary   = f.colors.brand.primary;
    const cardBg    = isDark ? f.colors.bg.elevated : "#FFFFFF";
    const border    = f.colors.border.default;
    const muted     = f.colors.text.muted;
    const isCenter  = !currentStep.target || currentStep.position === "center";
    const isFirst   = stepIndex === 0;
    const featureCount = totalSteps - 2;          // exclude welcome + done
    const featureIndex = stepIndex - 1;            // 0-based within feature steps

    // ── Spotlight tooltip positioning ──────────────────────────────────────
    const estimatedTooltipH = 360;
    const safeTop = rect
        ? Math.max(16, Math.min(rect.top + rect.height / 2 - estimatedTooltipH / 2, vh - estimatedTooltipH - 16))
        : vh / 2 - estimatedTooltipH / 2;
    const arrowOffsetTop = rect ? rect.top + rect.height / 2 - safeTop : estimatedTooltipH / 2;

    // Largura do tooltip nunca ultrapassa a viewport (tablets/celulares
    // estreitos) — em telas largas mantém a largura fixa de sempre.
    const tooltipW = Math.min(TOOLTIP_W, vw - VIEWPORT_MARGIN * 2);
    // Quando ancorado, o tooltip fica à direita do alvo — mas nunca a ponto
    // de vazar pela borda direita da tela.
    const anchoredLeft = rect
        ? Math.min(
            rect.left + rect.width + SPOTLIGHT_PAD + TOOLTIP_GAP,
            vw - tooltipW - VIEWPORT_MARGIN,
        )
        : 0;

    // ── Common card styles ─────────────────────────────────────────────────
    const cardBase: React.CSSProperties = {
        backgroundColor: cardBg,
        border: `1px solid ${border}`,
        borderRadius: "1.6rem",
        boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
        fontFamily: f.typography.fontFamily.base,
        opacity,
        transition: "opacity 0.25s ease, transform 0.25s ease",
    };

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label={currentStep.title}
            style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "auto" }}
        >
            {/* ── CENTER overlay (welcome / done) ──────────────────────────── */}
            {isCenter && (
                <div style={{
                    position: "fixed", inset: 0,
                    backgroundColor: `rgba(0,0,0,${opacity * 0.65})`,
                    transition: "background-color 0.25s ease",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <div style={{
                        ...cardBase,
                        maxWidth: "48rem",
                        width: "calc(100vw - 3.2rem)",
                        maxHeight: "calc(100vh - 3.2rem)",
                        overflowY: "auto",
                        padding: "4.8rem 4rem",
                        transform: opacity === 1 ? "scale(1)" : "scale(0.94)",
                        textAlign: "center",
                        position: "relative",
                    }}>
                        {/* Skip link (only on welcome) */}
                        {isFirst && (
                            <button
                                onClick={skip}
                                style={{
                                    position: "absolute", top: "1.6rem", right: "1.6rem",
                                    background: "none", border: "none", cursor: "pointer",
                                    color: muted, fontSize: "1.3rem", fontFamily: "inherit",
                                    padding: "0.4rem 0.8rem", borderRadius: "0.5rem",
                                }}
                            >
                                Pular
                            </button>
                        )}

                        {isFirst ? (
                            <WelcomeContent
                                f={f} primary={primary}
                                onStart={next} onSkip={skip}
                            />
                        ) : (
                            <DoneContent
                                f={f} isDark={isDark} primary={primary}
                                onFinish={next}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* ── SPOTLIGHT overlay (feature steps) ────────────────────────── */}
            {!isCenter && (
                <>
                    {/* Spotlight hole */}
                    {rect && (
                        <div style={{
                            position: "fixed",
                            top:    rect.top  - SPOTLIGHT_PAD,
                            left:   rect.left - SPOTLIGHT_PAD,
                            width:  rect.width  + SPOTLIGHT_PAD * 2,
                            height: rect.height + SPOTLIGHT_PAD * 2,
                            borderRadius: "10px",
                            boxShadow: `0 0 0 9999px rgba(0,0,0,${opacity * 0.65}), 0 0 0 2px ${primary}`,
                            transition: "all 0.3s ease",
                            pointerEvents: "none",
                        }} />
                    )}

                    {/* Fallback dimmed backdrop when no rect (e.g., sidebar collapsed on mobile) */}
                    {!rect && (
                        <div style={{
                            position: "fixed", inset: 0,
                            backgroundColor: `rgba(0,0,0,${opacity * 0.65})`,
                            transition: "background-color 0.25s ease",
                        }} />
                    )}

                    {/* Tooltip card */}
                    <div style={{
                        ...cardBase,
                        position: "fixed",
                        // Sem alvo (fallback centralizado): centraliza pela altura REAL do
                        // cartão via CSS (top:50% + translateY(-50%)) em vez de uma estimativa
                        // fixa — passos com mais dicas (ex.: Movimentações, Suporte) renderizam
                        // bem mais altos que `estimatedTooltipH` e, com a estimativa, o cartão
                        // acabava nascendo fora da viewport em celular (botões inalcançáveis).
                        top: rect ? safeTop : "50%",
                        left: rect ? anchoredLeft : "50%",
                        transform: !rect
                            ? `translate(-50%, -50%) ${opacity === 1 ? "scale(1)" : "scale(0.94)"}`
                            : opacity === 1 ? "scale(1)" : "scale(0.96)",
                        width: tooltipW,
                        maxWidth: `calc(100vw - ${VIEWPORT_MARGIN * 2}px)`,
                        // Segurança para qualquer combinação de altura de conteúdo/viewport —
                        // rola dentro do cartão em vez de vazar por baixo da tela.
                        maxHeight: `calc(100vh - ${VIEWPORT_MARGIN * 2}px)`,
                        overflowY: "auto",
                        padding: "2.4rem",
                    }}>
                        {/* Arrow pointing left toward spotlight */}
                        {rect && (
                            <div style={{
                                position: "absolute",
                                left: -9,
                                top: arrowOffsetTop - 8,
                                width: 0, height: 0,
                                borderTop: "8px solid transparent",
                                borderBottom: "8px solid transparent",
                                borderRight: `9px solid ${cardBg}`,
                                filter: "drop-shadow(-2px 0 2px rgba(0,0,0,0.12))",
                            }} />
                        )}

                        {/* Step icon */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: "1.2rem",
                            marginBottom: "1.6rem",
                        }}>
                            <div style={{
                                width: "4rem", height: "4rem", borderRadius: "1rem",
                                backgroundColor: isDark ? `${primary}20` : `${primary}15`,
                                color: primary,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                            }}>
                                {STEP_ICONS[currentStep.id]}
                            </div>
                            <div>
                                <h3 style={{ fontSize: "1.6rem", fontWeight: 700, color: f.colors.text.primary, margin: 0 }}>
                                    {currentStep.title}
                                </h3>
                                <span style={{ fontSize: "1.1rem", color: muted }}>
                                    {featureIndex + 1} de {featureCount}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <p style={{ fontSize: "1.35rem", color: f.colors.text.secondary, lineHeight: 1.6, margin: "0 0 1.6rem" }}>
                            {currentStep.description}
                        </p>

                        {/* Tips */}
                        {currentStep.tips && currentStep.tips.length > 0 && (
                            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                                {currentStep.tips.map((tip, i) => (
                                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem", fontSize: "1.25rem", color: f.colors.text.secondary }}>
                                        <span style={{ color: primary, fontWeight: 700, flexShrink: 0, lineHeight: 1.6 }}>✓</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Progress dots */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
                            {Array.from({ length: featureCount }).map((_, i) => (
                                <div key={i} style={{
                                    height: "0.5rem",
                                    width: i === featureIndex ? "2rem" : "0.5rem",
                                    borderRadius: "0.25rem",
                                    backgroundColor: i === featureIndex ? primary : border,
                                    transition: "all 0.3s ease",
                                }} />
                            ))}
                        </div>

                        {/* Navigation buttons */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.8rem" }}>
                            <button
                                onClick={featureIndex === 0 ? prev : prev}
                                style={{
                                    background: "none",
                                    border: `1px solid ${border}`,
                                    borderRadius: "0.8rem",
                                    padding: "0.7rem 1.4rem",
                                    fontSize: "1.3rem",
                                    color: muted,
                                    cursor: featureIndex === 0 ? "default" : "pointer",
                                    fontFamily: "inherit",
                                    opacity: featureIndex === 0 ? 0.4 : 1,
                                    transition: "opacity 0.15s ease",
                                }}
                                disabled={featureIndex === 0}
                            >
                                ← Anterior
                            </button>

                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                <button
                                    onClick={skip}
                                    style={{
                                        background: "none", border: "none",
                                        color: muted, fontSize: "1.2rem",
                                        cursor: "pointer", fontFamily: "inherit",
                                        padding: "0.4rem 0.8rem",
                                    }}
                                >
                                    Pular
                                </button>
                                <button
                                    onClick={next}
                                    style={{
                                        backgroundColor: primary,
                                        border: "none",
                                        borderRadius: "0.8rem",
                                        padding: "0.7rem 1.8rem",
                                        fontSize: "1.3rem",
                                        fontWeight: 600,
                                        color: "#fff",
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                    }}
                                >
                                    {featureIndex === featureCount - 1 ? "Concluir →" : "Próximo →"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>,
        document.body
    );
}

// ── Welcome card content ───────────────────────────────────────────────────

function WelcomeContent({ f, primary, onStart, onSkip }: {
    f: ReturnType<typeof getFoundationByTheme>;
    primary: string;
    onStart: () => void;
    onSkip: () => void;
}) {
    return (
        <>
            {/* Hero illustration */}
            <div style={{
                width: "7.2rem", height: "7.2rem", borderRadius: "1.8rem",
                background: `linear-gradient(135deg, ${primary}30 0%, ${primary}10 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 2.8rem",
                border: `1px solid ${primary}30`,
            }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                </svg>
            </div>

            <h2 style={{ fontSize: "2.6rem", fontWeight: 800, color: f.colors.text.primary, margin: "0 0 1.2rem", lineHeight: 1.2 }}>
                Bem-vindo ao{" "}
                <span style={{ color: primary }}>Finlumia</span>
            </h2>

            <p style={{ fontSize: "1.5rem", color: f.colors.text.secondary, lineHeight: 1.65, margin: "0 0 3.2rem" }}>
                Sua plataforma completa de gestão financeira pessoal.
                Vamos fazer um tour rápido para você conhecer os recursos principais.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <button
                    onClick={onStart}
                    style={{
                        width: "100%",
                        padding: "1.2rem",
                        backgroundColor: primary,
                        border: "none",
                        borderRadius: "1rem",
                        fontSize: "1.5rem",
                        fontWeight: 600,
                        color: "#fff",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "opacity 0.15s ease",
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.opacity = "0.9"; }}
                    onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.opacity = "1"; }}
                >
                    Iniciar tour →
                </button>
                <button
                    onClick={onSkip}
                    style={{
                        width: "100%",
                        padding: "1rem",
                        backgroundColor: "transparent",
                        border: `1px solid ${f.colors.border.default}`,
                        borderRadius: "1rem",
                        fontSize: "1.4rem",
                        color: f.colors.text.muted,
                        cursor: "pointer",
                        fontFamily: "inherit",
                    }}
                >
                    Pular, ir direto para o painel
                </button>
            </div>
        </>
    );
}

// ── Done card content ──────────────────────────────────────────────────────

function DoneContent({ f, isDark, primary, onFinish }: {
    f: ReturnType<typeof getFoundationByTheme>;
    isDark: boolean;
    primary: string;
    onFinish: () => void;
}) {
    return (
        <>
            {/* Success icon */}
            <div style={{
                width: "7.2rem", height: "7.2rem", borderRadius: "50%",
                backgroundColor: isDark ? f.colors.feedback.successBg : "#E6F4ED",
                border: `2px solid ${f.colors.feedback.success}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 2.8rem",
            }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={f.colors.feedback.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            </div>

            <h2 style={{ fontSize: "2.6rem", fontWeight: 800, color: f.colors.text.primary, margin: "0 0 1.2rem", lineHeight: 1.2 }}>
                Você está pronto!
            </h2>

            <p style={{ fontSize: "1.5rem", color: f.colors.text.secondary, lineHeight: 1.65, margin: "0 0 1.2rem" }}>
                Agora você conhece as principais funcionalidades do Finlumia.
            </p>

            <p style={{ fontSize: "1.3rem", color: f.colors.text.muted, lineHeight: 1.6, margin: "0 0 3.2rem" }}>
                Sempre que precisar rever o tutorial, clique no botão <strong>?</strong> no canto inferior da barra lateral.
            </p>

            <button
                onClick={onFinish}
                style={{
                    width: "100%",
                    padding: "1.2rem",
                    backgroundColor: primary,
                    border: "none",
                    borderRadius: "1rem",
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    color: "#fff",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "opacity 0.15s ease",
                }}
                onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.opacity = "0.9"; }}
                onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.opacity = "1"; }}
            >
                Começar a usar
            </button>
        </>
    );
}
