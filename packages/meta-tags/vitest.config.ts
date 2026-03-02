import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],
  test: {
    name: "@oktomusic/meta-tags",
    root: __dirname,
    globals: true,
    environment: "node",
    include: ["**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reportsDirectory: "../../coverage/meta-tags",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/**/*.{test,spec}.{ts,tsx}"],
    },
  },
});
