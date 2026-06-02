"use client";

import React, { useState } from "react";
import type { ThemeMode } from "../../../shared/styles/theme.types";
import { getFoundationByTheme } from "../../../shared/styles/tokens";

const W = 800;
const H = 260;
const PAD = { left: 58, right: 16, top: 20, bottom: 44 };
const PW = W - PAD.left - PAD.right;
const PH = H - PAD.top - PAD.bottom;

const GRID = 4;

export type BarSeries = { label: string; color: string };
export type BarGroup  = { label: string; values: number[] };

type BarChartProps = {
    groups: BarGroup[];
    series: BarSeries[];
    theme?: ThemeMode;
    formatY?: (v: number) => string;
    stacked?: boolean;
};

export function BarChart({ groups, series, theme = "dark", formatY, stacked = false }: BarChartProps) {
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";
    const [hovered, setHovered] = useState<{ g: number; s: number } | null>(null);

    const allValues = stacked
        ? groups.map((g) => g.values.reduce((a, b) => a + b, 0))
        : groups.flatMap((g) => g.values);
    const maxVal = Math.max(...allValues, 1);
    const niceMax = Math.ceil(maxVal / 1000) * 1000;

    const fmt = formatY ?? ((v: number) =>
        v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v.toFixed(0)}`
    );

    const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    const axisColor = f.colors.text.muted;

    const n = groups.length;
    const ns = series.length;
    const groupW = PW / n;
    const barW = stacked ? groupW * 0.55 : (groupW * 0.75) / ns;
    const groupGap = stacked ? (groupW - barW) / 2 : (groupW * 0.25) / (ns + 1);

    function barX(gi: number, si: number) {
        if (stacked) return PAD.left + gi * groupW + groupGap;
        return PAD.left + gi * groupW + groupGap * (si + 1) + barW * si;
    }

    function barH(v: number) {
        return (v / niceMax) * PH;
    }

    return (
        <div style={{ position: "relative", width: "100%" }}>
            <svg
                viewBox={`0 0 ${W} ${H}`}
                style={{ width: "100%", display: "block" }}
                aria-label="Gráfico de barras"
            >
                {/* Grid + Y labels */}
                {Array.from({ length: GRID + 1 }, (_, i) => {
                    const v = (niceMax * i) / GRID;
                    const y = PAD.top + PH - barH(v);
                    return (
                        <g key={i}>
                            <line x1={PAD.left} y1={y} x2={PAD.left + PW} y2={y}
                                stroke={gridColor} strokeWidth="1" />
                            <text x={PAD.left - 6} y={y + 4} textAnchor="end"
                                fontSize="11" fill={axisColor} fontFamily="inherit">
                                {fmt(v)}
                            </text>
                        </g>
                    );
                })}

                {/* Bars */}
                {groups.map((group, gi) => {
                    let stackOffset = 0;

                    return (
                        <g key={gi}>
                            {/* X label */}
                            <text
                                x={PAD.left + gi * groupW + groupW / 2}
                                y={PAD.top + PH + 18}
                                textAnchor="middle"
                                fontSize="12" fill={axisColor} fontFamily="inherit"
                            >
                                {group.label}
                            </text>

                            {group.values.map((v, si) => {
                                const bh = barH(v);
                                const bx = barX(gi, si);
                                const by = stacked
                                    ? PAD.top + PH - bh - stackOffset
                                    : PAD.top + PH - bh;
                                const color = series[si]?.color ?? "#888";
                                const isHov = hovered?.g === gi && hovered?.s === si;

                                if (stacked) stackOffset += bh;

                                return (
                                    <g key={si}>
                                        <rect
                                            x={bx} y={by}
                                            width={barW} height={Math.max(bh, 2)}
                                            rx="4" ry="4"
                                            fill={color}
                                            opacity={hovered && !isHov ? 0.45 : 1}
                                            style={{ cursor: "pointer", transition: "opacity 0.15s ease" }}
                                            onMouseEnter={() => setHovered({ g: gi, s: si })}
                                            onMouseLeave={() => setHovered(null)}
                                        />
                                        {/* Value on hover */}
                                        {isHov && bh > 20 && (
                                            <text
                                                x={bx + barW / 2} y={by + 14}
                                                textAnchor="middle"
                                                fontSize="11" fontWeight="700"
                                                fill="#fff" fontFamily="inherit"
                                            >
                                                {fmt(v)}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                        </g>
                    );
                })}

                {/* Baseline */}
                <line
                    x1={PAD.left} y1={PAD.top + PH}
                    x2={PAD.left + PW} y2={PAD.top + PH}
                    stroke={gridColor} strokeWidth="1"
                />
            </svg>

            {/* Tooltip */}
            {hovered !== null && (() => {
                const { g, s } = hovered;
                const x = barX(g, s) + barW / 2;
                const leftPct = ((x) / W) * 100;
                return (
                    <div style={{
                        position: "absolute",
                        left: `${leftPct}%`,
                        top: "1rem",
                        transform: leftPct > 65 ? "translateX(-100%) translateX(-1rem)" : "translateX(0.8rem)",
                        pointerEvents: "none",
                        backgroundColor: isDark ? f.colors.bg.surface : "#fff",
                        border: `1px solid ${f.colors.border.default}`,
                        borderRadius: "0.8rem",
                        padding: "0.8rem 1.2rem",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                        minWidth: "12rem",
                        zIndex: 10,
                    }}>
                        <div style={{ fontSize: "1.2rem", fontWeight: 600, color: f.colors.text.muted, marginBottom: "0.4rem" }}>
                            {groups[g].label}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <div style={{ width: "0.8rem", height: "0.8rem", borderRadius: "50%", backgroundColor: series[s]?.color }} />
                            <span style={{ fontSize: "1.2rem", color: f.colors.text.secondary }}>{series[s]?.label}</span>
                            <span style={{ fontSize: "1.3rem", fontWeight: 700, color: series[s]?.color, marginLeft: "auto" }}>
                                {groups[g].values[s].toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </span>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
