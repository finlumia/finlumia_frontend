import type { ThemeMode } from "../../../shared/styles/theme.types";
import type { IconProps } from "../../atoms/icon";
import type { TextProps } from "../../atoms/text";

export type LogoProps = {
    text?: TextProps;
    icon?: IconProps;
    onClick?: () => void;
    theme?: ThemeMode;
    styleLogo?: LogoStyleConfig;
}

export type LogoStyleConfig = {
    backgroudColor?: string;
    display?: "inline" | "block" | "inline-block" | "flex" | "inline-flex";
    visibility?: "visible" | "hidden" | "collapse";
    opacity?: number;
    transition?: string;
    transform?: string;
    padding?: string;
    textAlign?: "left" | "center" | "right";
    align?: "left" | "center" | "right";
    justifyContent?: "flex-start" | "center" | "flex-end";
};
