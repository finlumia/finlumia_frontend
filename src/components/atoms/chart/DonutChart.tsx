"use client";

import React, { useState } from "react";
import type { ThemeMode } from "../../../shared/styles/theme.types";
import { getFoundationByTheme } from "../../../shared/styles/tokens";

const CX = 120;
const CY = 120;
const R  = 96;   // outer radius
const IR = 62;   // inner radius (donut hole)
const SIZE = 240;

function polarToCart(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSegment(
    cx: number, cy: number,
    r: number, ir: number,
    startDeg: number, endDeg: number,
): string {
    const delta = endDeg - startDeg;
    // Protect against full-circle: cap at 359.99
    const end = startDeg + Math.min(delta, 359.999);
    const large = delta > 180 ? 1 : 0;

    const o1 = polarToCart(cx, cy, r,  startDeg);
    const o2 = polarToCart(cx, cy, r,  end);
    const i2 = polarToCart(cx, cy, ir, end);
    const i1 = polarToCart(cx, cy, ir, startDeg);

    const f = (n: number) => n.toFixed(3);

    return [
        `M ${f(o1.x)} ${f(o1.y)}`,
        `A ${r} ${r} 0 ${large} 1 ${f(o2.x)} ${f(o2.y)}`,
        `L ${f(i2.x)} ${f(i2.y)}`,
        `A ${ir} ${ir} 0 ${large} 0 ${f(i1.x)} ${f(i1.y)}`,
        "Z",
    ].join(" ");
}

export type DonutSlice = {
    id: string;
    label: string;
    value: number;
    percent: number;
    color: string;
};

type DonutChartProps = {
    slices: DonutSlice[];
    centerLabel?: string;
    centerValue?: string;
    theme?: ThemeMode;
};

export function DonutChart({ slices, centerLabel, centerValue, theme = "dark" }: DonutChartProps) {
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";
    const [hovered, setHovered] = useState<string | null>(null);

    const total = slices.reduce((s, d) => s + d.value, 0);

    let cursor = 0;
    const segments = slices.map((sl) => {
        const deg = (sl.value / total) * 360;
        const start = cursor;
        cursor += deg;
        return { ...sl, start, end: cursor };
    });

    const hoveredSlice = hovered ? segments.find((s) => s.id === hovered) : null;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "2.4rem", flexWrap: "wrap" }}>
            {/* SVG */}
            <div style={{ position: "relative", flexShrink: 0 }}>
                <svg
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    width={SIZE}
                    height={SIZE}
                    aria-label="Gráfico de rosca por categoria"
                >
                    {segments.map((seg) => {
                        const isHov = hovered === seg.id;
                        const scale = isHov ? 1.06 : 1;
                        return (
                            <path
                                key={seg.id}
                                d={donutSegment(CX, CY, isHov ? R + 6 : R, isHov ? IR - 2 : IR, seg.start, seg.end)}
                                fill={seg.color}
                                opacity={hovered && !isHov ? 0.45 : 1}
                                style={{ cursor: "pointer", transition: "opacity 0.2s ease, d 0.15s ease" }}
                                onMouseEnter={() => setHovered(seg.id)}
                                onMouseLeave={() => setHovered(null)}
                                aria-label={`${seg.label}: ${seg.percent.toFixed(1)}%`}
                            />
                        );
                    })}

                    {/* Center text */}
                    {hoveredSlice ? (
                        <>
                            <text x={CX} y={CY - 8} textAnchor="middle" fontSize="11" fill={f.colors.text.muted} fontFamily="inherit">
                                {hoveredSlice.label}
                            </text>
                            <text x={CX} y={CY + 12} textAnchor="middle" fontSize="20" fontWeight="700" fill={hoveredSlice.color} fontFamily="inherit">
                                {hoveredSlice.percent.toFixed(1)}%
                            </text>
                            <text x={CX} y={CY + 30} textAnchor="middle" fontSize="11" fill={f.colors.text.muted} fontFamily="inherit">
                                {hoveredSlice.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </text>
                        </>
                    ) : (
                        <>
                            {centerLabel && (
                                <text x={CX} y={CY - 8} textAnchor="middle" fontSize="11" fill={f.colors.text.muted} fontFamily="inherit">
                                    {centerLabel}
                                </text>
                            )}
                            {centerValue && (
                                <text x={CX} y={CY + 14} textAnchor="middle" fontSize="19" fontWeight="700" fill={f.colors.text.primary} fontFamily="inherit">
                                    {centerValue}
                                </text>
                            )}
                        </>
                    )}
                </svg>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1, minWidth: "14rem" }}>
                {segments.map((seg) => {
                    const isHov = hovered === seg.id;
                    return (
                        <div
                            key={seg.id}
                            style={{
                                display: "flex", alignItems: "center", gap: "0.8rem",
                                cursor: "pointer",
                                opacity: hovered && !isHov ? 0.45 : 1,
                                transition: "opacity 0.2s ease",
                            }}
                            onMouseEnter={() => setHovered(seg.id)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            <div style={{
                                width: "0.8rem", height: "0.8rem", borderRadius: "50%",
                                backgroundColor: seg.color, flexShrink: 0,
                            }} />
                            <span style={{ fontSize: "1.2rem", color: f.colors.text.secondary, flex: 1 }}>
                                {seg.label}
                            </span>
                            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: isHov ? seg.color : f.colors.text.primary }}>
                                {seg.percent.toFixed(1)}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
