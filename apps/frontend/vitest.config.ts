import { defineConfig } from "vitest/config";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  plugins: [
    react(),
    babel({
      plugins: [
        "babel-plugin-react-compiler",
        "@lingui/babel-plugin-lingui-macro",
      ],
      presets: [reactCompilerPreset(), "jotai-babel/preset"],
    }),
  ],
  test: {
    name: "@oktomusic/frontend",
    root: __dirname,
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
