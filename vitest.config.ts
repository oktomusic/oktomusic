import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: [
      "./apps/backend/vitest.config.ts",
      "./apps/backend/vitest.e2e.config.ts",
      "./apps/frontend/vitest.config.ts",
    ],
  },
})
