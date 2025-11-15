import path from "node:path";

import { defineConfig } from "vitest/config";
//import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  //plugins: [viteTsconfigPaths()],
  resolve: {
    alias: {
      "@oktomusic/api-schemas": path.resolve(
        __dirname,
        "./test/mocks/api-schemas.ts",
      ),
      "openid-client": path.resolve(__dirname, "./test/mocks/openid-client.ts"),
      src: path.resolve(__dirname, "./src"),
    },
  },
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
