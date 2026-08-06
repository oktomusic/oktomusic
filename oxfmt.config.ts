import { defineConfig, type SortImportsConfig } from "oxfmt";

const sortImportsConfig = {
  customGroups: [
    {
      groupName: "node-builtin",
      selector: "builtin",
    },
    {
      elementNamePattern: ["@oktomusic/**"],
      groupName: "oktomusic",
    },
    {
      elementNamePattern: ["./**", "../**"],
      groupName: "relative",
    },
    {
      elementNamePattern: ["**"],
      groupName: "other-package",
    },
  ],
  groups: ["node-builtin", "other-package", "oktomusic", "relative"],
  internalPattern: ["@oktomusic/"],
  newlinesBetween: true,
  order: "asc",
  sortSideEffects: true,
} satisfies SortImportsConfig;

const sortImportsBackendConfig = {
  ...sortImportsConfig,
  customGroups: [
    {
      elementNamePattern: ["@nestjs/common", "@nestjs/core"],
      groupName: "nestjs-core",
    },
    {
      elementNamePattern: ["@nestjs/**"],
      groupName: "nestjs",
    },
    ...(sortImportsConfig.customGroups ?? []),
  ],
  groups: [
    "node-builtin",
    "nestjs-core",
    { newlinesBetween: false },
    "nestjs",
    { newlinesBetween: false },
    "other-package",
    "oktomusic",
    "relative",
  ],
} satisfies SortImportsConfig;

const sortImportsFrontendConfig = {
  ...sortImportsConfig,
  customGroups: [
    {
      elementNamePattern: [
        "react",
        "react/**",
        "react-dom",
        "react-dom/**",
        "react-router",
      ],
      groupName: "react",
    },
    {
      elementNamePattern: ["./*.css", "./**/*.css", "../*.css", "../**/*.css"],
      groupName: "local-style",
      modifiers: ["side_effect"],
    },
    ...(sortImportsConfig.customGroups ?? []),
  ],
  groups: [
    "node-builtin",
    "react",
    { newlinesBetween: false },
    "other-package",
    "oktomusic",
    "relative",
    "local-style",
  ],
} satisfies SortImportsConfig;

export default defineConfig({
  printWidth: 80,
  trailingComma: "all",
  sortImports: sortImportsConfig,
  sortPackageJson: true,
  sortTailwindcss: true,
  ignorePatterns: [
    ".github/skills/**",
    "apps/backend/dist",
    "apps/backend/prisma/migrations/**",
    "apps/backend/src/api/schema.gql",
    "apps/backend/src/generated",
    "apps/backend/src/views/**/*.hbs",
    "apps/frontend/dist",
    "apps/frontend/src/locales/**/*.ts",
    "apps/frontend/src/api/graphql/gql",
    "apps/website/.vitepress/dist",
    "apps/website/.vitepress/cache",
    "**/node_modules",
    "packages/**/dist",
    "pnpm-lock.yaml",
  ],
  overrides: [
    {
      files: ["apps/backend/**/*.{ts,tsx}"],
      options: {
        sortImports: sortImportsBackendConfig,
      },
    },
    {
      files: ["apps/frontend/**/*.{ts,tsx}"],
      options: {
        sortImports: sortImportsFrontendConfig,
      },
    },
    {
      files: ["*.json", "*.jsonc"],
      options: {
        tabWidth: 2,
        trailingComma: "all",
      },
    },
  ],
});
