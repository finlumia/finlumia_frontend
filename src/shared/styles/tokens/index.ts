import { lightFoundation } from "./foundation/light";
import { darkFoundation } from "./foundation/dark";
import type { ThemeMode } from "../theme.types";

export const atomicTokens = {
  light: lightFoundation,
  dark: darkFoundation,
} as const;

export const getFoundationByTheme = (theme: ThemeMode) => atomicTokens[theme];