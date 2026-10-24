import e18e from "@e18e/eslint-plugin";
import lingui from "eslint-plugin-lingui";
import { defineConfig } from "oxlint";

export default defineConfig({
  ignorePatterns: [
    "**/node_modules/**",
    "**/dist/**",
    "**/dev-dist/**",
    "**/cache/**",
    "**/tsdown.config.ts",
    "packages/**/vitest.config.ts",
    "**/generated/prisma/**",
    "coverage/**",
    "apps/frontend/src/locales/**",
    "apps/frontend/src/api/graphql/gql/**",
  ],
  // Disabled after the migration audit: vitest (119 errors), jsx-a11y (19 errors).
  plugins: [
    "oxc",
    "typescript",
    "react",
    "react-perf",
    "import",
    "jsdoc",
    "promise",
  ],
  jsPlugins: ["@e18e/eslint-plugin", "eslint-plugin-lingui"],
  categories: {
    correctness: "error",
  },
  options: {
    typeAware: true,
  },
  overrides: [
    {
      files: ["apps/backend/**/*.ts"],
      rules: {
        ...e18e.configs.recommended.rules,
        "e18e/ban-dependencies": ["error", { allowed: ["express"] }],
      },
    },
    {
      files: ["apps/frontend/**/*.{ts,tsx}"],
      rules: {
        ...e18e.configs.recommended.rules,
        ...lingui.configs["flat/recommended"].rules,
      },
    },
  ],
});
