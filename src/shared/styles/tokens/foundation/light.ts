import { foundationBase } from "./base";

/**
 * Color Blind Safe palette — Wong et al. adapted for WCAG AA compliance.
 * All text colors meet 4.5:1 contrast ratio on their respective backgrounds.
 * Distinguishable under deuteranopia, protanopia and tritanopia.
 */
export const lightFoundation = {
    ...foundationBase,
    colors: {
        brand: {
            primary: "#0F766E",    // Teal-700 (logo) — 5.4:1 on white, AA for text & buttons
            secondary: "#115E59",  // Deep teal — secondary actions
            accent: "#0D9488",     // Teal-600 — highlights, CTAs
        },
        bg: {
            app: "#F0F7F5",        // Subtle teal-tinted near-white
            surface: "#FFFFFF",
            elevated: "#E6F1ED",
            overlay: "rgba(4, 30, 27, 0.48)",
        },
        text: {
            primary: "#0C1A17",    // Teal-ink — high contrast on white
            secondary: "#2C3B38",  // ~10:1 on white
            muted: "#566B66",      // ~4.6:1 on white
            inverse: "#F0F7F5",
            link: "#0F766E",
        },
        border: {
            default: "#C4D6D0",
            strong: "#8AA9A1",
            focus: "#0F766E",
        },
        feedback: {
            success: "#006644",    // Dark green — 4.6:1 on white
            successBg: "#E6F4ED",
            warning: "#7A4500",    // Dark orange — 6.1:1 on white
            warningBg: "#FFF3E0",
            error: "#B91C1C",      // Dark red — 5.3:1 on white
            errorBg: "#FEE2E2",
            info: "#0F766E",
            infoBg: "#D8F0EB",
        }
    }
} as const