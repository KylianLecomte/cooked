// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";

/** Config de base pour tous les packages TypeScript du monorepo */
export const baseConfig = tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Les variables préfixées _ sont autorisées non-utilisées (convention courante)
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // any explicite est un warning, pas une erreur — parfois nécessaire
      "@typescript-eslint/no-explicit-any": "warn",
      // console.log en prod est indésirable, warn pour ne pas bloquer le dev
      "no-console": "warn",
    },
  },
  {
    // Fichiers à ignorer globalement
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      ".turbo/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "commitlint.config.js",
    ],
  },
);

export default baseConfig;
