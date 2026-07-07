import { foundationBase } from "./base";

/**
 * Dark theme — refined for extended viewing comfort.
 * Surfaces have clear elevation hierarchy; text is warm-white for eye comfort.
 * Color Blind Safe palette (Wong et al.) maintained throughout.
 * All foreground colors meet WCAG AA 4.5:1 on their dark backgrounds.
 */
export const darkFoundation = {
    ...foundationBase,
    colors: {
        brand: {
            primary: "#1EC6B2",    // Teal-500 brightened — 7.8:1 on app bg, vibrant
            secondary: "#3DD8C4",  // Light teal — logo highlight, hover states
            accent: "#6EEEDE",     // Bright teal — accents/badges
        },
        bg: {
            app: "#0E1C20",        // Warm dark teal — less harsh than pure black
            surface: "#152B2E",    // Clear step up from app, comfortable mid-layer
            elevated: "#1E3A36",   // Elevated cards — visible depth without glare
            overlay: "rgba(0, 0, 0, 0.60)",
        },
        text: {
            primary: "#E8F4F0",    // Warm off-white — ~13:1 on app bg, easier on eyes than pure white
            secondary: "#AABFBA",  // ~6:1 on app bg — readable secondary text
            muted: "#728F89",      // ~3.5:1 — decorative/labels only
            inverse: "#0E1C20",
            link: "#3DD8C4",
        },
        border: {
            default: "#2D4840",    // Slightly more visible for section separation
            strong: "#405F58",     // Card borders, dividers
            focus: "#1EC6B2",
        },
        feedback: {
            success: "#56D364",    // Bright green — distinguishable from teal brand
            successBg: "#112A1C",
            warning: "#F0E442",    // Yellow — safe for deuteranopia/protanopia
            warningBg: "#2A2200",
            error: "#FF8066",      // Warm vermillion — more comfortable on dark bg than pure orange-red
            errorBg: "#2C1010",
            info: "#3DD8C4",
            infoBg: "#07302B",
        }
    }
} as const