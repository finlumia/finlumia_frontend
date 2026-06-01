import { lightFoundation } from "../foundation/light";
import { darkFoundation } from "../foundation/dark";

const buttonBase = {
  size: {
    sm: { height: "3.2rem", paddingX: "1.2rem", fontSize: "1.2rem" },
    md: { height: "4.0rem", paddingX: "1.6rem", fontSize: "1.4rem" },
    lg: { height: "4.8rem", paddingX: "2.0rem", fontSize: "1.6rem" },
  },
  shape: {
    borderRadius: "1rem",
  },
  state: {
    disabledOpacity: 0.6,
  },
} as const;

const createThemeButtonTokens = (foundation: typeof lightFoundation | typeof darkFoundation) => ({
  primary: {
    backgroundColor: foundation.colors.brand.primary,
    textColor: foundation.colors.text.inverse,
    borderColor: "transparent",
  },
  secondary: {
    backgroundColor: foundation.colors.bg.surface,
    textColor: foundation.colors.text.primary,
    borderColor: foundation.colors.border.default,
  },
  outlined: {
    backgroundColor: "transparent",
    textColor: foundation.colors.text.primary,
    borderColor: foundation.colors.border.strong,
  },
  inverted: {
    backgroundColor: foundation.colors.text.primary,
    textColor: foundation.colors.bg.surface,
    borderColor: "transparent",
  },
} as const);

export const buttonTokens = {
  base: buttonBase,
  light: createThemeButtonTokens(lightFoundation),
  dark: createThemeButtonTokens(darkFoundation),
} as const;