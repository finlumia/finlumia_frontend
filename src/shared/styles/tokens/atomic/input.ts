import { lightFoundation } from "../foundation/light";
import { darkFoundation } from "../foundation/dark";
import { colorblindFoundation } from "../foundation/colorblind";

const createThemeInputTokens = (
    foundation: typeof lightFoundation | typeof darkFoundation | typeof colorblindFoundation,
) => ({
    backgroundColor: foundation.colors.bg.surface,
    textColor: foundation.colors.text.primary,
    placeholderColor: foundation.colors.text.muted,
    borderColor: foundation.colors.border.default,
    borderColorFocus: foundation.colors.border.focus,
    borderColorError: foundation.colors.feedback.error,
    labelColor: foundation.colors.text.secondary,
    helperColor: foundation.colors.text.muted,
    errorColor: foundation.colors.feedback.error,
    iconColor: foundation.colors.text.muted,
} as const);

export const inputTokens = {
    light: createThemeInputTokens(lightFoundation),
    dark: {
        ...createThemeInputTokens(darkFoundation),
        backgroundColor: darkFoundation.colors.bg.elevated,
    },
    colorblind: createThemeInputTokens(colorblindFoundation),
    base: {
        height: { sm: "3.2rem", md: "4rem", lg: "4.8rem" },
        fontSize: { sm: "1.2rem", md: "1.4rem", lg: "1.6rem" },
        padding: { sm: "0 1rem", md: "0 1.2rem", lg: "0 1.4rem" },
        borderRadius: "0.8rem",
        borderWidth: "1px",
        gap: "0.6rem",
    },
} as const;
