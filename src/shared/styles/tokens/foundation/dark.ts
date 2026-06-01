import { foundationBase } from "./base";

export const darkFoundation = {
    ...foundationBase,
    colors: {
        brand: {
            primary: "#2DEBCE",
            secondary: "#F59E0B",
            tertiary: "#4ADE80",
        },
        bg: {
            app: "#081220",
            surface: "#0D1B2A",
            elevated: "#13253A",
        },
        text: {
            primary: "#E2E8F0",
            secondary: "#94A3B8",
            muted: "#64748B",
            inverse: "#0B1220",
        },
        border: {
            default: "#243447",
            strong: "#334155",
            focus: "#2DEBCE",
        },
        feedback: {
            success: "#4ADE80",
            warning: "#FBBF24",
            error: "#F87171",
            info: "#38BDF8",
        }
    }
} as const