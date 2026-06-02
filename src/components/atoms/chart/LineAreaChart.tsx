"use client";

import React, { useState, useId } from "react";
import type { ThemeMode } from "../../../shared/styles/theme.types";
import { getFoundationByTheme } from "../../../shared/styles/tokens";

const W = 800;
const H = 280;
const PAD = { left: 62, right: 24, top: 24, bottom: 48 };
const PW = W - PAD.left - PAD.right;
const PH = H - PAD.top - PAD.bottom;

export type LineSeries = {
    label: string;
    values: number[];
    color: string;
    showArea?: boolean;
};

type Tooltip = { x: number; y: number; idx: number } | null;

type LineAreaChartProps = {
    series: LineSeries[];
    labels: string[];      // x-axis labels
    theme?: ThemeMode;
    height?: number;
    formatY?: (v: number) => string;
};

function toX(i: number, n: number) {
    return PAD.left + (n > 1 ? (i / (n - 1)) * PW : PW / 2);
}

function toY(v: number, min: number, max: number) {
    if (max === min) return PAD.top + PH / 2;
    return PAD.top + (1 - (v - min) / (max - min)) * PH;
}

function buildPath(values: number[], min: number, max: number, n: number) {
    return values
        .map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i, n).toFixed(1)} ${toY(v, min, max).toFixed(1)}`)
        .join(" ");
}

function buildArea(values: number[], min: number, max: number, n: number) {
    const line = buildPath(values, min, max, n);
    const last = `L ${toX(n - 1, n).toFixed(1)} ${(PAD.top + PH).toFixed(1)}`;
    const first = `L ${toX(0, n).toFixed(1)} ${(PAD.top + PH).toFixed(1)} Z`;
    return `${line} ${last} ${first}`;
}

const GRID_LINES = 5;

export function LineAreaChart({ series, labels, theme = "dark", formatY }: LineAreaChartProps) {
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";
    const uid = useId().replace(/:/g, "");
    const [tooltip, setTooltip] = useState<Tooltip>(null);

    const allValues = series.flatMap((s) => s.values);
    const rawMin = Math.min(...allValues);
    const rawMax = Math.max(...allValues);
    const padding = (rawMax - rawMin) * 0.1 || 1000;
    const min = Math.max(0, rawMin - padding);
    const max = rawMax + padding;

    const n = labels.length;
    const fmt = formatY ?? ((v: number) =>
        v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v.toFixed(0)}`
    );

    const gridValues = Array.from({ length: GRID_LINES + 1 }, (_, i) =>
        min + ((max - min) * i) / GRID_LINES
    );

    const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    const axisColor = f.colors.text.muted;

    return (
        <div style={{ position: "relative", width: "100%" }}>
            <svg
                viewBox={`0 0 ${W} ${H}`}
                style={{ width: "100%", display: "block", overflow: "visible" }}
                aria-label="Gráfico de linhas"
            >
                {/* Gradient defs */}
                <defs>
                    {series.map((s, si) => (
                        <linearGradient key={si} id={`${uid}-grad-${si}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={s.color} stopOpacity={isDark ? 0.35 : 0.25} />
                            <stop offset="100%" stopColor={s.color} stopOpacity={0.01} />
                        </linearGradient>
                    ))}
                </defs>

                {/* Horizontal grid lines */}
                {gridValues.map((v, gi) => {
                    const y = toY(v, min, max);
                    return (
                        <g key={gi}>
                            <line
                                x1={PAD.left} y1={y} x2={PAD.left + PW} y2={y}
                                stroke={gridColor} strokeWidth="1"
                            />
                            <text
                                x={PAD.left - 6} y={y + 4}
                                textAnchor="end"
                                fontSize="11" fill={axisColor}
                                fontFamily="inherit"
                            >
                                {fmt(v)}
                            </text>
                        </g>
                    );
                })}

                {/* X-axis labels */}
                {labels.map((label, i) => (
                    <text
                        key={i}
                        x={toX(i, n)} y={PAD.top + PH + 20}
                        textAnchor="middle"
                        fontSize="12" fill={axisColor}
                        fontFamily="inherit"
                    >
                        {label}
                    </text>
                ))}

                {/* X-axis baseline */}
                <line
                    x1={PAD.left} y1={PAD.top + PH}
                    x2={PAD.left + PW} y2={PAD.top + PH}
                    stroke={gridColor} strokeWidth="1"
                />

                {/* Areas */}
                {series.map((s, si) =>
                    s.showArea !== false ? (
                        <path
                            key={`area-${si}`}
                            d={buildArea(s.values, min, max, n)}
                            fill={`url(#${uid}-grad-${si})`}
                            stroke="none"
                        />
                    ) : null
                )}

                {/* Lines */}
                {series.map((s, si) => (
                    <path
                        key={`line-${si}`}
                        d={buildPath(s.values, min, max, n)}
                        fill="none"
                        stroke={s.color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                ))}

                {/* Dots + hover hit area */}
                {labels.map((_, i) => {
                    const x = toX(i, n);
                    return (
                        <g key={i}>
                            {/* Invisible wide hit column */}
                            <rect
                                x={x - (PW / n) / 2} y={PAD.top}
                                width={PW / n} height={PH}
                                fill="transparent"
                                onMouseEnter={() => setTooltip({ x, y: PAD.top, idx: i })}
                                onMouseLeave={() => setTooltip(null)}
                                style={{ cursor: "crosshair" }}
                            />
                            {tooltip?.idx === i && (
                                <line
                                    x1={x} y1={PAD.top} x2={x} y2={PAD.top + PH}
                                    stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}
                                    strokeWidth="1" strokeDasharray="4 3"
                                />
                            )}
                            {series.map((s, si) => {
                                const cy = toY(s.values[i], min, max);
                                const isHovered = tooltip?.idx === i;
                                return (
                                    <circle
                                        key={si}
                                        cx={x} cy={cy} r={isHovered ? 5 : 3.5}
                                        fill={isHovered ? s.color : (isDark ? f.colors.bg.elevated : "#fff")}
                                        stroke={s.color}
                                        strokeWidth="2"
                                        style={{ transition: "r 0.1s ease" }}
                                    />
                                );
                            })}
                        </g>
                    );
                })}
            </svg>

            {/* Tooltip */}
            {tooltip !== null && (() => {
                const i = tooltip.idx;
                const leftPct = ((toX(i, n)) / W) * 100;
                return (
                    <div style={{
                        position: "absolute",
                        left: `${leftPct}%`,
                        top: "1.2rem",
                        transform: leftPct > 70 ? "translateX(-100%) translateX(-1rem)" : "translateX(1rem)",
                        pointerEvents: "none",
                        backgroundColor: isDark ? f.colors.bg.surface : "#fff",
                        border: `1px solid ${f.colors.border.default}`,
                        borderRadius: "0.8rem",
                        padding: "0.8rem 1.2rem",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                        minWidth: "14rem",
                        zIndex: 10,
                    }}>
                        <div style={{ fontSize: "1.2rem", fontWeight: 600, color: f.colors.text.muted, marginBottom: "0.6rem" }}>
                            {labels[i]}
                        </div>
                        {series.map((s, si) => (
                            <div key={si} style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.2rem" }}>
                                <div style={{ width: "0.8rem", height: "0.8rem", borderRadius: "50%", backgroundColor: s.color, flexShrink: 0 }} />
                                <span style={{ fontSize: "1.2rem", color: f.colors.text.secondary }}>{s.label}</span>
                                <span style={{ fontSize: "1.3rem", fontWeight: 700, color: s.color, marginLeft: "auto" }}>
                                    {s.values[i]?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </span>
                            </div>
                        ))}
                    </div>
                );
            })()}
        </div>
    );
}
