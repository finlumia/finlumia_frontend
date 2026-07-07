"use client";

import React from "react";
import styles from "./Input.module.css";
import type { InputProps } from "./Input.types";
import { inputTokens } from "../../../shared/styles/tokens/atomic/input";
import { getFoundationByTheme } from "../../../shared/styles/tokens";

export function Input({
    id,
    name,
    label,
    placeholder,
    value,
    defaultValue,
    type = "text",
    size = "md",
    theme = "light",
    disabled = false,
    readOnly = false,
    error,
    helper,
    icon,
    iconPosition = "left",
    required = false,
    autoComplete,
    inputMode,
    onChange,
    onBlur,
    onFocus,
}: InputProps) {
    const t = inputTokens[theme];
    const base = inputTokens.base;
    const foundation = getFoundationByTheme(theme);

    const hasIcon = !!icon;
    const hasIconLeft = hasIcon && iconPosition === "left";
    const hasIconRight = hasIcon && iconPosition === "right";

    const inputStyle: React.CSSProperties = {
        backgroundColor: t.backgroundColor,
        color: t.textColor,
        borderColor: error ? t.borderColorError : t.borderColor,
        borderWidth: base.borderWidth,
        borderRadius: base.borderRadius,
        height: base.height[size],
        fontSize: base.fontSize[size],
        padding: base.padding[size],
        fontFamily: foundation.typography.fontFamily.base,
    };

    const labelStyle: React.CSSProperties = {
        color: t.labelColor,
        fontFamily: foundation.typography.fontFamily.base,
    };

    const helperStyle: React.CSSProperties = {
        color: t.helperColor,
        fontFamily: foundation.typography.fontFamily.base,
    };

    const errorStyle: React.CSSProperties = {
        color: t.errorColor,
        fontFamily: foundation.typography.fontFamily.base,
    };

    const iconStyle: React.CSSProperties = {
        color: t.iconColor,
        width: "1.6rem",
        height: "1.6rem",
    };

    const inputClasses = [
        styles.input,
        hasIconLeft ? styles.hasIconLeft : "",
        hasIconRight ? styles.hasIconRight : "",
    ].filter(Boolean).join(" ");

    return (
        <div className={styles.wrapper}>
            {label && (
                <label htmlFor={id} className={styles.label} style={labelStyle}>
                    {label}
                    {required && <span className={styles.required} aria-hidden="true">*</span>}
                </label>
            )}
            <div className={styles.inputRow}>
                {hasIconLeft && (
                    <span className={`${styles.icon} ${styles.iconLeft}`} style={iconStyle}>
                        {icon}
                    </span>
                )}
                <input
                    id={id}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    defaultValue={defaultValue}
                    disabled={disabled}
                    readOnly={readOnly}
                    required={required}
                    autoComplete={autoComplete}
                    inputMode={inputMode}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
                    onChange={onChange}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    className={inputClasses}
                    style={inputStyle}
                />
                {hasIconRight && (
                    <span className={`${styles.icon} ${styles.iconRight}`} style={iconStyle}>
                        {icon}
                    </span>
                )}
            </div>
            {error && (
                <span id={`${id}-error`} className={styles.error} style={errorStyle} role="alert">
                    ⚠ {error}
                </span>
            )}
            {!error && helper && (
                <span id={`${id}-helper`} className={styles.helper} style={helperStyle}>
                    {helper}
                </span>
            )}
        </div>
    );
}
