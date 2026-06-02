"use client";

import React from "react";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { useTheme } from "../../../shared/styles/theme.context";

export default function Page() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    return (
        <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base }}>
            <h1 style={{ fontSize: "2.4rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.4rem" }}>
                Suporte
            </h1>
            <p style={{ fontSize: "1.4rem", color: f.colors.text.muted }}>
                Central de ajuda, tutoriais e abertura de chamados.
            </p>
        </div>
    );
}
