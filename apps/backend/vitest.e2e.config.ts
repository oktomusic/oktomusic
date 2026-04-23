import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@oktomusic/backend:e2e",
    root: __dirname,
    globals: true,
    environment: "node",
    include: ["test/**/*.e2e-spec.ts"],
    coverage: {
      provider: "v8",
      reportsDirectory: "../../coverage/backend-e2e",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.spec.ts", "src/**/*.e2e-spec.ts"],
    },
  },
});
