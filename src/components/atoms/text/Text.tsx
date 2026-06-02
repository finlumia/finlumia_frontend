import type { TextProps } from "./Text.types";
import React from "react";
import styles from "./Text.module.css";
import { getFoundationByTheme } from "../../../shared/styles/tokens";

export function Text({
    label,
    as = "div",
    className,
    onClick,
    theme = "light",
    variant = "primary",
    size = "md",
    styleConfig,
}: TextProps) {
    const Element = as;
    const foundation = getFoundationByTheme(theme);

    const resolveAlignItems = (value?: "left" | "center" | "right"): React.CSSProperties["alignItems"] => {
        if (value === "left") return "flex-start";
        if (value === "right") return "flex-end";
        return "center";
    };

    const variantPreset: Record<NonNullable<TextProps["variant"]>, React.CSSProperties> = {
        primary: {
            backgroundColor: "transparent",
            color: foundation.colors.text.primary,
        },
        secondary: {
            backgroundColor: "transparent",
            color: foundation.colors.text.secondary,
        },
        outlined: {
            backgroundColor: "transparent",
            color: foundation.colors.text.primary,
            border: `${foundation.borderWidth.thin} solid ${foundation.colors.border.strong}`,
        },
        inverted: {
            backgroundColor: foundation.colors.text.primary,
            color: foundation.colors.bg.surface,
            borderRadius: "0.8rem",
        },
        goldBadge: {
            background: theme === "dark"
                ? "linear-gradient(90deg, rgba(173, 122, 49, 0.3), rgba(206, 159, 85, 0.18))"
                : "linear-gradient(90deg, rgba(212, 165, 92, 0.28), rgba(236, 195, 132, 0.2))",
            color: theme === "dark" ? "#e8c27a" : "#8a5a1f",
            border: theme === "dark"
                ? "1px solid rgba(214, 168, 93, 0.55)"
                : "1px solid rgba(176, 124, 54, 0.62)",
            borderRadius: "999px",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            fontWeight: 600,
        },
        heroTitle: {
            backgroundColor: "transparent",
            color: foundation.colors.text.primary,
            fontWeight: 800,
        },
        heroHighlight: {
            backgroundColor: "transparent",
            color: foundation.colors.brand.primary,
            fontWeight: 800,
        },
        heroDescription: {
            backgroundColor: "transparent",
            color: foundation.colors.text.secondary,
            fontWeight: 400,
        },
    };

    const sizePreset: Record<NonNullable<TextProps["size"]>, React.CSSProperties> = {
        xs: { fontSize: "1.2rem", lineHeight: "1.4rem" },
        sm: { fontSize: "1.4rem", lineHeight: "1.8rem" },
        md: { fontSize: "1.6rem", lineHeight: "2.2rem" },
        lg: { fontSize: "2.4rem", lineHeight: "3rem" },
        xl: { fontSize: "3.2rem", lineHeight: "3.8rem" },
        hero: { fontSize: "3.4rem", lineHeight: "1.12" },
    };

    const styleText: React.CSSProperties = {
        ...variantPreset[variant],
        ...sizePreset[size],
        backgroundColor: styleConfig?.backgroundColor ?? styleConfig?.backgroudColor ?? variantPreset[variant].backgroundColor,
        color: styleConfig?.textColor ?? variantPreset[variant].color,
        fontFamily: styleConfig?.fontFamily || foundation.typography.fontFamily.base,
        fontSize: styleConfig?.fontSize || sizePreset[size].fontSize,
        fontWeight: styleConfig?.fontWeight || variantPreset[variant].fontWeight || foundation.typography.fontWeight.semibold,
        lineHeight: styleConfig?.lineHeight || sizePreset[size].lineHeight,
        letterSpacing: styleConfig?.letterSpacing || variantPreset[variant].letterSpacing,
        textTransform: styleConfig?.textTransform || variantPreset[variant].textTransform,
        width: styleConfig?.width ?? "auto",
        maxWidth: styleConfig?.maxWidth ?? "none",
        height: styleConfig?.height ?? "auto",
        margin: styleConfig?.margin ?? "0",
        padding: styleConfig?.padding ?? "0",
        textAlign: styleConfig?.textAlign ?? styleConfig?.align ?? "left",
        alignItems: resolveAlignItems(styleConfig?.align),
        justifyContent: styleConfig?.justifyContent ?? "center",
        borderRadius: styleConfig?.borderRadius ?? variantPreset[variant].borderRadius,
        display: styleConfig?.display ?? "inline-flex",
        visibility: styleConfig?.visibility ?? "visible",
        opacity: styleConfig?.opacity ?? 1,
        cursor: styleConfig?.cursor ?? (onClick ? "pointer" : "default"),
        transition: styleConfig?.transition ?? "filter 0.2s ease, transform 0.2s ease",
        transform: styleConfig?.transform ?? "none",
        filter: styleConfig?.filter ?? "none",
        boxShadow: styleConfig?.boxShadow ?? "none",
        border: styleConfig?.border ?? variantPreset[variant].border ?? "none",
    };

    const classNames = [styles.text, onClick ? styles.clickable : "", className ?? ""].filter(Boolean).join(" ");

    return (
        <Element
            className={classNames}
            style={styleText}
            onClick={onClick}
        >
            {label}
        </Element>
    )
}

export default Text;