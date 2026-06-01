
import React from "react";
import type { IconProps } from "./Icon.types";
import { iconTokens } from "../../../shared/styles/tokens/atomic/icon";
import styles from "./Icon.module.css";


export function Icon({
    src,
    alt,
    size = "md",
    disabled = false,
    className,
    onClick,
    lampEffect = false,
    isOn = false,
    styleConfig,
}: IconProps) {
    const sizeTokens = iconTokens.base.size[size];
    const classNames = [
        styles.icon,
        onClick ? styles.clickable : "",
        lampEffect ? styles.lampEffect : "",
        lampEffect ? (isOn ? styles.lampOn : styles.lampOff) : "",
        className ?? "",
    ].filter(Boolean).join(" ");

    const iconStyle: React.CSSProperties = {
        width: sizeTokens.width,
        height: sizeTokens.height,
        opacity: disabled ? iconTokens.base.state.disabledOpacity : 1,
        backgroundColor: styleConfig?.backgroundColor,
        border: styleConfig?.border,
        borderRadius: styleConfig?.borderRadius,
        padding: styleConfig?.padding,
        boxShadow: styleConfig?.boxShadow,
    }

    return (
        <img
            src={src}
            alt={alt}
            className={classNames}
            style={iconStyle}
            onClick={onClick}
        />
    )
}