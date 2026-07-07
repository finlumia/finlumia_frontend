"use client";

import React, { useRef } from "react";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import type { ThemeMode } from "../../../shared/styles/theme.types";

type OtpInputProps = {
    value: string[];
    onChange: (next: string[]) => void;
    theme?: ThemeMode;
    error?: string;
    length?: number;
};

export function OtpInput({ value, onChange, theme = "light", error, length = 6 }: OtpInputProps) {
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";
    const borderColor = f.colors.border.default;
    const primaryColor = f.colors.brand.primary;

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleInput = (index: number, digit: string) => {
        if (!/^\d?$/.test(digit)) return;
        const next = [...value];
        next[index] = digit;
        onChange(next);
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <div>
            <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", marginBottom: "0.8rem" }}>
                {Array.from({ length }).map((_, i) => {
                    const digit = value[i] ?? "";
                    return (
                        <input
                            key={i}
                            ref={(el) => { inputRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleInput(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            aria-label={`Dígito ${i + 1} do código`}
                            style={{
                                width: "4.8rem",
                                height: "5.6rem",
                                textAlign: "center",
                                fontSize: "2rem",
                                fontWeight: 700,
                                borderRadius: "0.8rem",
                                border: `2px solid ${error ? f.colors.feedback.error : digit ? primaryColor : borderColor}`,
                                backgroundColor: isDark ? f.colors.bg.elevated : "#F5F7FA",
                                color: f.colors.text.primary,
                                fontFamily: "inherit",
                                outline: "none",
                                transition: "border-color 0.15s ease",
                            }}
                        />
                    );
                })}
            </div>
            {error && (
                <p style={{ color: f.colors.feedback.error, fontSize: "1.2rem", textAlign: "center", marginBottom: "1.2rem" }}>
                    ⚠ {error}
                </p>
            )}
        </div>
    );
}
