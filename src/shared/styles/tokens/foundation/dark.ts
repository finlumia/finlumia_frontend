import { foundationBase } from "./base";

/**
 * Dark theme — Color Blind Safe palette (Wong et al.).
 * All foreground colors meet 4.5:1 contrast on their dark backgrounds.
 */
export const darkFoundation = {
    ...foundationBase,
    colors: {
        brand: {
            primary: "#14B8A6",    // Teal-500 (logo) — 7.2:1 on app bg, vibrant on dark
            secondary: "#2DD4BF",  // Light teal — logo highlight stop
            accent: "#5EEAD4",     // Bright teal — accents/highlights
        },
        bg: {
            app: "#08161A",        // Deep teal-black
            surface: "#0F2120",
            elevated: "#163029",
            overlay: "rgba(0, 0, 0, 0.64)",
        },
        text: {
            primary: "#E4F2EE",    // ~14:1 on app bg
            secondary: "#9CB3AD",  // ~5:1 on app bg
            muted: "#6E847E",      // decorative/non-critical
            inverse: "#08161A",
            link: "#2DD4BF",
        },
        border: {
            default: "#264039",
            strong: "#3E5B52",
            focus: "#14B8A6",
        },
        feedback: {
            success: "#56D364",    // Bright green — distinguishable from teal brand
            successBg: "#0F2A1A",
            warning: "#F0E442",    // Yellow — safe for deuteranopia/protanopia
            warningBg: "#2A2200",
            error: "#FF7B54",      // Vermillion — 4.6:1 on dark, safe for CVD
            errorBg: "#2A1010",
            info: "#2DD4BF",
            infoBg: "#06322B",
        }
    }
} as const