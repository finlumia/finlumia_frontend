import React from "react";
import type { ImageProps } from "./Image.types";
import styles from "./Image.module.css";

export function Image({
    src,
    alt,
    width,
    height,
    className,
    loading = "lazy",
    decode = "async",
    isSvg = false,
    onClick,
    styleConfig,
}: ImageProps) {
    const finalStyle: React.CSSProperties = {
        width: styleConfig?.width ?? width ?? "auto",
        height: styleConfig?.height ?? height ?? "auto",
        maxWidth: styleConfig?.maxWidth ?? "100%",
        backgroundColor: styleConfig?.backgroundColor ?? styleConfig?.backgroudColor,
        border: styleConfig?.border,
        borderRadius: styleConfig?.borderRadius,
        padding: styleConfig?.padding,
        boxShadow: styleConfig?.boxShadow,
        objectFit: styleConfig?.objectFit ?? (isSvg ? "contain" : "cover"),
        objectPosition: styleConfig?.objectPosition ?? "center",
        display: styleConfig?.display ?? "block",
    };

    const classNames = [styles.image, onClick ? styles.clickable : "", className ?? ""].filter(Boolean).join(" ");

    return (
        <img
            src={src}
            alt={alt}
            loading={loading}
            decoding={decode}
            className={classNames}
            style={finalStyle}
            onClick={onClick}
        />
    );
}

export default Image;
