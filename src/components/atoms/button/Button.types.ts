import type { ThemeMode } from "../../../shared/styles/theme.types";

export type ButtonVariant = "primary" | "secondary" | "outlined" | "inverted";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonStyleConfig = {
    backgroudColor?: string;
    display?: string;
    textColor?: string;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    width?: string;
    height?: string;
    padding?: string;
    borderRadius?: string;
    border?: string;
    textAlign?: "left" | "center" | "right";
    align?: "left" | "center" | "right";
    justifyContent?: "flex-start" | "center" | "flex-end";
};

export type ButtonProps = {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    theme?: ThemeMode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    styleConfig?: ButtonStyleConfig;
};
