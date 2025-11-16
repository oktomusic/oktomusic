/// <reference types="@types/node" />

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactRefresh from "eslint-plugin-react-refresh";
import pluginReactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier/flat";
import pluginLingui from "eslint-plugin-lingui";
import { defineConfig, globalIgnores } from "eslint/config";

const configBase = [
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  prettier,
];

const configsReact = [
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  pluginReact.configs.flat.recommended,
  pluginReactRefresh.configs.vite,
  pluginReactHooks.configs.flat["recommended-latest"],
  prettier,
  pluginLingui.configs["flat/recommended"],
];

export default defineConfig([
  globalIgnores([
    "node_modules",
    "**/dist",
    "**/cache",
    "**/tsdown.config.ts",
    "packages/**/vitest.config.ts",
    "**/generated/prisma",
    "coverage",
  ]),

  // @oktomusic/backend (NestJS)
  {
    files: ["apps/backend/**/*.ts"],
    extends: configBase,
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        project: "./apps/backend/tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["apps/backend/**/*.spec.ts", "apps/backend/**/*.e2e-spec.ts"],
    extends: configBase,
    languageOptions: {
      globals: { ...globals.node, ...globals.vitest },
      parserOptions: {
        project: "./apps/backend/tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // @oktomusic/frontend (Vite)
  {
    files: ["apps/frontend/**/*.{ts,tsx}"],
    ignores: [
      "apps/frontend/src/locales/**",
      "apps/frontend/src/api/graphql/gql/**",
    ],
    extends: configsReact,
    languageOptions: {
      globals: { ...globals.node },
      ecmaVersion: 2020,
      parserOptions: {
        project: "./apps/frontend/tsconfig.app.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    files: [
      "apps/frontend/vite.config.ts",
      "apps/frontend/vitest.config.ts",
      "apps/frontend/lingui.config.ts",
      "apps/frontend/codegen.ts",
    ],
    extends: configBase,
    languageOptions: {
      globals: { ...globals.node },
      ecmaVersion: 2020,
      parserOptions: {
        project: "./apps/frontend/tsconfig.node.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // @oktomusic/api-schemas (tsdown)
  {
    files: ["packages/api-schemas/**/*.ts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      prettier,
    ],
    languageOptions: {
      parserOptions: {
        project: "./packages/api-schemas/tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // @oktomusic/lyrics (tsdown)
  {
    files: ["packages/lyrics/**/*.ts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      prettier,
    ],
    languageOptions: {
      parserOptions: {
        project: "./packages/lyrics/tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // @oktomusic/metaflac-parser (tsdown)
  {
    files: ["packages/metaflac-parser/**/*.ts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      prettier,
    ],
    languageOptions: {
      parserOptions: {
        project: "./packages/metaflac-parser/tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // @oktomusic/vite-sri-manifest (tsdown)
  {
    files: ["packages/vite-sri-manifest/**/*.ts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      prettier,
    ],
    languageOptions: {
      parserOptions: {
        project: "./packages/vite-sri-manifest/tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
