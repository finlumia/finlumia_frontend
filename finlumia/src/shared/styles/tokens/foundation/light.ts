import { foundationBase } from "./base";

export const lightFoundation = {
    ...foundationBase,
    colors: {
        brand: {
            primary: "#00C9A7",
            secondary: "#0D1B2A",
            tertiary: "#F59E0B",
        },
        bg: {
            app: "#F8FAFC",
            surface: "#FFFFFF",
            elevated: "#F1F5F9",
        },
        text: {
            primary: "#0F172A",
            secondary: "#334155",
            muted: "#64748B",
            inverse: "#F8FAFC",
        },
        border: {
            default: "#CBD5E1",
            strong: "#94A3B8",
            focus: "#00C9A7",
        },
        feedback: {
            success: "#22C55E",
            warning: "#F59E0B",
            error: "#EF4444",
            info: "#0EA5E9",
        }
    }
} as const