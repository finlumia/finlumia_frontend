import { lightFoundation } from "./foundation/light";
import { darkFoundation } from "./foundation/dark";
import { colorblindFoundation } from "./foundation/colorblind";
import type { ThemeMode } from "../theme.types";

export const atomicTokens = {
  light: lightFoundation,
  dark: darkFoundation,
  colorblind: colorblindFoundation,
} as const;

export const getFoundationByTheme = (theme: ThemeMode) => atomicTokens[theme];
