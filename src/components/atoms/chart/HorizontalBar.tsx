"use client";

import React, { useState } from "react";
import type { ThemeMode } from "../../../shared/styles/theme.types";
import { getFoundationByTheme } from "../../../shared/styles/tokens";

export type HBarItem = {
    id: string;
    label: string;
    value: number;
    percent: number;   // 0–100
    color: string;
    sublabel?: string;
};

type HorizontalBarProps = {
    items: HBarItem[];
    theme?: ThemeMode;
    formatValue?: (v: number) => string;
};

export function HorizontalBar({ items, theme = "dark", formatValue }: HorizontalBarProps) {
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";
    const [hovered, setHovered] = useState<string | null>(null);

    const fmt = formatValue ?? ((v: number) =>
        v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    );

    const trackColor = isDark ? f.colors.border.default : f.colors.border.default;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
            {items.map((item) => {
                const isHov = hovered === item.id;
                return (
                    <div
                        key={item.id}
                        onMouseEnter={() => setHovered(item.id)}
                        onMouseLeave={() => setHovered(null)}
                        style={{ cursor: "default" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                <div style={{
                                    width: "0.8rem", height: "0.8rem",
                                    borderRadius: "50%",
                                    backgroundColor: item.color,
                                    flexShrink: 0,
                                }} />
                                <span style={{ fontSize: "1.3rem", fontWeight: isHov ? 600 : 400, color: f.colors.text.secondary, transition: "font-weight 0.1s" }}>
                                    {item.label}
                                </span>
                                {item.sublabel && (
                                    <span style={{ fontSize: "1.1rem", color: f.colors.text.muted }}>{item.sublabel}</span>
                                )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <span style={{ fontSize: "1.1rem", color: f.colors.text.muted }}>{item.percent.toFixed(1)}%</span>
                                <span style={{ fontSize: "1.3rem", fontWeight: 700, color: isHov ? item.color : f.colors.text.primary, minWidth: "8rem", textAlign: "right" }}>
                                    {fmt(item.value)}
                                </span>
                            </div>
                        </div>

                        <div style={{
                            height: "0.6rem",
                            backgroundColor: trackColor,
                            borderRadius: "999px",
                            overflow: "hidden",
                        }}>
                            <div style={{
                                height: "100%",
                                width: `${item.percent}%`,
                                backgroundColor: item.color,
                                borderRadius: "999px",
                                opacity: hovered && !isHov ? 0.4 : 1,
                                transition: "width 0.6s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease",
                            }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
