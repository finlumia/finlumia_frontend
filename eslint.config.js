import { dirname } from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

export default defineConfig([
  globalIgnores([".next", "out", "node_modules"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      ...compat.extends("next/core-web-vitals", "next/typescript"),
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Legitimate patterns (localStorage hydration, modal reset, route-driven UI).
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
