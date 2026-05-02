export type ThemeMode = "light" | "dark";

export const foundationBase = {
    typography: {
        fontFamily: {
            base: "Inter, Manrope, sans-serif",
            heading: "Manrope, sans-serif",
            mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
        },
        fontSize: {
            xs: "1.2rem",
            sm: "1.4rem",
            md: "1.6rem",
            lg: "2.0rem",
            xl: "2.8rem"
        },
        fontWeight: {
            regular: "400",
            medium: "500",
            semibold: "600",
            bold: "700"
        },
        lineHeight: {
            tight: 1.2,
            normal: 1.5,
            relaxed: 1.7
        }
    },
    spacing: {
        xxs: "0.4rem",
        xs: "0.8rem",
        sm: "1.2rem",
        md: "1.6rem",
        lg: "2.4rem",
        xl: "3.2rem",
        xxl: "4.0rem"
    },
    radius: {
        sm: "0.6rem",
        md: "1rem",
        lg: "1.4rem"
    },
    borderWidth: {
        none: "0",
        thin: "1rem",
        thick: "2rem"
    },
    shadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.35)",
        md: "0 8px 24px rgba(0, 0, 0, 0.45)"
    }
} as const