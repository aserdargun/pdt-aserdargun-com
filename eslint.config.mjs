import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "out/**", "node_modules/**", "test-results/**", "playwright-report/**", "vendor/**", "source/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ["scripts/**/*.{mjs,js}", "tests/**/*.{mjs,js}", "*.config.ts"],
    languageOptions: { globals: globals.node },
  },
);
