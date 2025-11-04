import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { lingui } from "@lingui/vite-plugin";
import manifestSRIPlugin from "@oktomusic/vite-sri-manifest";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          "babel-plugin-react-compiler",
          "@lingui/babel-plugin-lingui-macro",
        ],
        presets: ["jotai/babel/preset"],
      },
    }),
    lingui(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    manifestSRIPlugin(),
  ],
  server: {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET"],
    },
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: "ws",
      port: 5173,
    },
    origin: "http://localhost:5173",
  },
  build: {
    manifest: true,
    rollupOptions: {
      input: "src/main.tsx",
    },
    outDir: "dist",
  },
  base: "/",
});
