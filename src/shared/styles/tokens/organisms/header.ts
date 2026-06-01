import { darkFoundation } from "../foundation/dark";
import { lightFoundation } from "../foundation/light";

const headerBase = {
  height: {
    sm: "5.6rem",
    md: "6.4rem",
    lg: "7.2rem",
  },
  padding: {
    sm: "0 1.2rem",
    md: "0 1.6rem",
    lg: "0 2.4rem",
  },
  gap: {
    sm: "0.8rem",
    md: "1.2rem",
    lg: "1.6rem",
  },
  border: {
    width: "1px",
  },
  backdrop: {
    blur: "6px",
  },
} as const;

/**
 * Creates theme-aware Header surface tokens from a foundation palette.
 * Used to build `headerTokens.light` and `headerTokens.dark`.
 */
const createThemeHeaderTokens = (foundation: typeof lightFoundation | typeof darkFoundation) => ({
  default: {
    backgroundColor: foundation.colors.bg.surface,
    textColor: foundation.colors.text.primary,
    borderColor: foundation.colors.border.default,
    shadow: foundation.shadow.sm,
  },
  elevated: {
    backgroundColor: foundation.colors.bg.elevated,
    textColor: foundation.colors.text.primary,
    borderColor: foundation.colors.border.strong,
    shadow: foundation.shadow.md,
  },
  transparent: {
    backgroundColor: "transparent",
    textColor: foundation.colors.text.primary,
    borderColor: "transparent",
    shadow: "none",
  },
} as const);

export const headerTokens = {
  base: headerBase,
  light: createThemeHeaderTokens(lightFoundation),
  dark: createThemeHeaderTokens(darkFoundation),
} as const;