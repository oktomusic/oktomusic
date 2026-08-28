import babel from "@rolldown/plugin-babel";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react({ compiler: true }),
    babel({
      presets: ["jotai-babel/preset"],
    }),
  ],
  test: {
    name: "@oktomusic/frontend",
    root: import.meta.dirname,
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reportsDirectory: "../../coverage/frontend",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/**/*.{test,spec}.{ts,tsx}"],
    },
    css: {
      modules: {
        classNameStrategy: "non-scoped",
      },
    },
  },
});
