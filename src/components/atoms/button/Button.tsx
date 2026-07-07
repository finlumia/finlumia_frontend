import type { ButtonProps } from "./Button.types";
import React from "react";
import styles from "./Button.module.css";
import { buttonTokens } from "../../../shared/styles/tokens/atomic/button";
import { getFoundationByTheme } from "../../../shared/styles/tokens";

export function Button({
    label,
    onClick,
    disabled = false,
    type = "button",
    theme = "light",
    variant = "primary",
    size = "md",
    styleConfig,
}: ButtonProps) {
    const foundation = getFoundationByTheme(theme);
    const variantTokens = buttonTokens[theme][variant];
    const sizeTokens = buttonTokens.base.size[size];

    const finalStyle: React.CSSProperties = {
        backgroundColor: styleConfig?.backgroudColor || variantTokens.backgroundColor,
        display: styleConfig?.display ?? "inline-flex",
        color: styleConfig?.textColor || variantTokens.textColor,
        fontFamily: styleConfig?.fontFamily || foundation.typography.fontFamily.base,
        fontSize: styleConfig?.fontSize || sizeTokens.fontSize,
        fontWeight: styleConfig?.fontWeight || foundation.typography.fontWeight.semibold,
        width: styleConfig?.width ?? "auto",
        height: styleConfig?.height ?? sizeTokens.height,
        padding: styleConfig?.padding ?? `0 ${sizeTokens.paddingX}`,
        borderRadius: styleConfig?.borderRadius ?? buttonTokens.base.shape.borderRadius,
        border: styleConfig?.border ?? `${foundation.borderWidth.thin} solid ${variantTokens.borderColor}`,
        opacity: disabled ? buttonTokens.base.state.disabledOpacity : styleConfig?.opacity ?? 1,
        textAlign: styleConfig?.align ?? "center",
        alignItems: styleConfig?.align ?? "center",
        justifyContent: styleConfig?.justifyContent ?? "center",
    };
    return (
        <button
            type={type}
            className={styles.button}
            style={finalStyle}
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </button>
    )
}
