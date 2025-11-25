import { defineConfig } from "vitepress";
import { withPwa } from "@vite-pwa/vitepress";

import path from "node:path";

// https://vitepress.dev/reference/site-config
export default withPwa(
  defineConfig({
    srcDir: "docs",
    title: "Oktomusic",
    description: "Opinionated, self-hosted music streaming server",
    themeConfig: {
      // https://vitepress.dev/reference/default-theme-config
      nav: [
        { text: "Home", link: "/" },
        { text: "Get Started", link: "/guide/installation" },
      ],

      sidebar: [
        {
          text: "Get Started",
          items: [{ text: "Installation", link: "/guide/installation" }],
        },
        {
          text: "Design",
          items: [
            { text: "Architecture", link: "/design" },
            { text: "Auth", link: "/auth" },
          ],
        },
      ],

      socialLinks: [
        { icon: "github", link: "https://github.com/oktomusic/oktomusic" },
      ],
    },
    cleanUrls: true,
    vite: {
      server: {
        port: 3200,
      },
    },
    pwa: {
      manifest: {
        name: "Oktomusic Documentation",
        short_name: "Oktomusic Docs",
        description: "Opinionated, self-hosted music streaming server",
        categories: ["music", "entertainment"],
        start_url: "/",
        display: "standalone",
        display_override: ["standalone", "browser"],
        background_color: "#ffffff",
        theme_color: "#000000",
        lang: "en",
        dir: "ltr",
        scope: "/",
        prefer_related_applications: false,
      },
      strategies: "generateSW",
      outDir: path.resolve(__dirname, "dist"),
      pwaAssets: {
        config: true,
        integration: {
          outDir: path.resolve(__dirname, "dist"),
        },
      },
      experimental: {
        includeAllowlist: true,
      },
      includeAssets: ["favicon.svg"],
      devOptions: {
        enabled: true,
      },
    },
  }),
);
