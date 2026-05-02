import type { ThemeMode } from "../../../shared/styles/theme.types";
import type { ButtonProps } from "../../atoms/button";
import type { IconProps } from "../../atoms/icon";
import type { TextProps } from "../../atoms/text";
import type { LogoProps } from "../../molecules/logo";

export type HeaderItem =
    | { type: "logo"; props: LogoProps; key?: string }
    | { type: "text"; props: TextProps; key?: string }
    | { type: "icon"; props: IconProps; key?: string }
    | { type: "button"; props: ButtonProps; key?: string }
    ;

export type HeaderProps = {
    items?: HeaderItem[];
    leftItems?: HeaderItem[];
    centerItems?: HeaderItem[];
    rightItems?: HeaderItem[];
    text?: TextProps;
    icon?: IconProps;
    logo?: LogoProps;
    theme?: ThemeMode;
    buttons?: ButtonProps[];
    styleHeader?: HeaderStyleConfig;
}

export type HeaderStyleConfig = {
    backgroundColor?: string;
    backgroudColor?: string;
    display?: "inline" | "block" | "inline-block" | "flex" | "inline-flex";
    visibility?: "visible" | "hidden" | "collapse";
    padding?: string;
    align?: "left" | "center" | "right";
    justifyContent?: "flex-start" | "center" | "flex-end" | "space-between";
    gap?: string;
    centerGap?: string;
    rightGap?: string;
    flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
};
