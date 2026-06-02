import { lightFoundation } from "../foundation/light";
import { darkFoundation } from "../foundation/dark";

export const inputTokens = {
    light: {
        backgroundColor: lightFoundation.colors.bg.surface,
        textColor: lightFoundation.colors.text.primary,
        placeholderColor: lightFoundation.colors.text.muted,
        borderColor: lightFoundation.colors.border.default,
        borderColorFocus: lightFoundation.colors.border.focus,
        borderColorError: lightFoundation.colors.feedback.error,
        labelColor: lightFoundation.colors.text.secondary,
        helperColor: lightFoundation.colors.text.muted,
        errorColor: lightFoundation.colors.feedback.error,
        iconColor: lightFoundation.colors.text.muted,
    },
    dark: {
        backgroundColor: darkFoundation.colors.bg.elevated,
        textColor: darkFoundation.colors.text.primary,
        placeholderColor: darkFoundation.colors.text.muted,
        borderColor: darkFoundation.colors.border.default,
        borderColorFocus: darkFoundation.colors.border.focus,
        borderColorError: darkFoundation.colors.feedback.error,
        labelColor: darkFoundation.colors.text.secondary,
        helperColor: darkFoundation.colors.text.muted,
        errorColor: darkFoundation.colors.feedback.error,
        iconColor: darkFoundation.colors.text.muted,
    },
    base: {
        height: { sm: "3.2rem", md: "4rem", lg: "4.8rem" },
        fontSize: { sm: "1.2rem", md: "1.4rem", lg: "1.6rem" },
        padding: { sm: "0 1rem", md: "0 1.2rem", lg: "0 1.4rem" },
        borderRadius: "0.8rem",
        borderWidth: "1px",
        gap: "0.6rem",
    },
} as const;
