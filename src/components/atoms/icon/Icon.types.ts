import type { ThemeMode } from "../../../shared/styles/theme.types";

export type IconSize = "sm" | "md" | "lg";

export type IconProps = {
    src?: string;
    alt?: string;
    disabled?: boolean;
    size?: IconSize;
    theme?: ThemeMode;
    className?: string;
    onClick?: () => void;
    lampEffect?: boolean;
    isOn?: boolean;
    styleConfig?: {
        backgroundColor?: string;
        border?: string;
        borderRadius?: string;
        padding?: string;
        boxShadow?: string;
    };
};