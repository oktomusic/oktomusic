import { defineConfig } from "vitest/config"
import viteTsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [viteTsconfigPaths()],
  resolve: {
    alias: {
      "@oktomusic/api-schemas": "/home/runner/work/oktomusic/oktomusic/apps/backend/test/mocks/api-schemas.ts",
      "openid-client": "/home/runner/work/oktomusic/oktomusic/apps/backend/test/mocks/openid-client.ts",
    },
  },
  test: {
    name: "@oktomusic/backend",
    root: "./apps/backend",
    globals: true,
    environment: "node",
    include: ["src/**/*.spec.ts"],
    exclude: ["test/**/*.e2e-spec.ts", "node_modules/**"],
    coverage: {
      provider: "v8",
      reportsDirectory: "../../coverage/backend",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.spec.ts", "src/**/*.e2e-spec.ts"],
    },
  },
})
