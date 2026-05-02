import type { ThemeMode } from "../../../shared/styles/theme.types";

export type TextVariant =
    | "primary"
    | "secondary"
    | "outlined"
    | "inverted"
    | "goldBadge"
    | "heroTitle"
    | "heroHighlight"
    | "heroDescription";
export type TextSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";
export type TextElement = "h1" | "h2" | "h3" | "div" | "p";

export type TextStyleConfig = {
    backgroundColor?: string;
    backgroudColor?: string;
    display?: string;
    visibility?: "visible" | "hidden" | "collapse";
    opacity?: number;
    cursor?: "pointer" | "default" | "not-allowed";
    transition?: string;
    transform?: string;
    filter?: string;
    boxShadow?: string;
    border?: string;
    borderRadius?: string;
    textColor?: string;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
    textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
    width?: string;
    maxWidth?: string;
    height?: string;
    padding?: string;
    margin?: string;
    textAlign?: "left" | "center" | "right";
    align?: "left" | "center" | "right";
    justifyContent?: "flex-start" | "center" | "flex-end";
};

export type TextProps = {
    label: string;
    as?: TextElement;
    className?: string;
    onClick?: () => void;
    theme?: ThemeMode;
    variant?: TextVariant;
    size?: TextSize;
    styleConfig?: TextStyleConfig;
};
