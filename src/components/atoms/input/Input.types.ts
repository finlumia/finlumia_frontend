import type React from "react";
import type { ThemeMode } from "../../../shared/styles/theme.types";

export type InputSize = "sm" | "md" | "lg";
export type InputType = "text" | "email" | "password" | "number" | "tel" | "search";

export type InputProps = {
    id: string;
    name: string;
    label?: string;
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    type?: InputType;
    size?: InputSize;
    theme?: ThemeMode;
    disabled?: boolean;
    readOnly?: boolean;
    error?: string;
    helper?: string;
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
    required?: boolean;
    autoComplete?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
};
