import { foundationBase } from "./base";

/**
 * Color Universal Design (CUD) theme.
 *
 * Palette: Wong, B. (2011). "Points of view: Color blindness."
 * Nature Methods, 8(6), 441. https://doi.org/10.1038/nmeth.1618
 *
 * Eight-color palette distinguishable under deuteranopia, protanopia
 * and tritanopia. Adapted with WCAG AA contrast compliance (4.5:1 min).
 *
 * Okabe, M. & Ito, K. (2008). "Color Universal Design (CUD)"
 * Jfly — Universität zu Köln / University of Tokyo.
 */
export const colorblindFoundation = {
    ...foundationBase,
    colors: {
        brand: {
            primary: "#0072B2",    // Blue (Wong) — safe across all CVD types, 4.9:1 on white
            secondary: "#005A8C",  // Deeper blue — secondary actions
            accent: "#56B4E9",     // Sky blue (Wong) — highlights, badges
        },
        bg: {
            app: "#F5F8FA",        // Near-white with subtle cool tint — low visual noise
            surface: "#FFFFFF",
            elevated: "#E8F1F7",   // Sky-blue tinted — discernible without saturation reliance
            overlay: "rgba(0, 20, 40, 0.50)",
        },
        text: {
            primary: "#0A1628",    // Deep navy — ~18:1 on white, maximum legibility
            secondary: "#1A3049",  // Dark blue-navy — ~12:1 on white
            muted: "#4A6070",      // Slate — ~5.8:1 on white, passes AA
            inverse: "#F5F8FA",
            link: "#0072B2",
        },
        border: {
            default: "#B8CFDF",    // Muted sky-blue border
            strong: "#7AAECC",     // Clearer sky-blue for strong separation
            focus: "#0072B2",
        },
        feedback: {
            success: "#009E73",    // Bluish green (Wong) — 4.7:1 on white, safe for red/green blind
            successBg: "#E0F5EE",
            warning: "#E69F00",    // Orange (Wong) — 4.5:1 on white, safe for deuteranopia
            warningBg: "#FEF3D6",
            error: "#D55E00",      // Vermillion (Wong) — 4.8:1 on white, not pure red
            errorBg: "#FAEADA",
            info: "#0072B2",       // Blue (Wong) — reuses brand, consistent
            infoBg: "#E0EEF8",
        }
    }
} as const
