import { defineConfig } from "vitepress";
import { withPwa } from "@vite-pwa/vitepress";
import llmstxt from "vitepress-plugin-llms";

// https://vitepress.dev/reference/site-config
export default withPwa(
  defineConfig({
    srcDir: "docs",
    title: "Oktomusic",
    description: "A media server",
    head: [
      ["link", { rel: "icon", href: "/favicon.ico", sizes: "48x48" }],
      [
        "link",
        {
          rel: "icon",
          href: "/favicon.svg",
          sizes: "any",
          type: "image/svg+xml",
        },
      ],
      [
        "link",
        { rel: "apple-touch-icon", href: "/apple-touch-icon-180x180.png" },
      ],
    ],
    themeConfig: {
      // https://vitepress.dev/reference/default-theme-config
      nav: [
        { text: "Home", link: "/" },
        { text: "Get Started", link: "/guide/installation" },
      ],

      sidebar: [
        {
          text: "Get Started",
          items: [
            { text: "Installation", link: "/guide/installation" },
            { text: "OpenID Connect setup", link: "/guide/openid" },
            { text: "Music Collection", link: "/guide/music-collection" },
            { text: "LLMs", link: "/guide/llms" },
            { text: "FAQ", link: "/guide/faq" },
          ],
        },
        {
          text: "Advanced",
          items: [
            {
              text: "Configuration Reference",
              link: "/advanced/configuration",
            },
            { text: "Kiosk Mode", link: "/advanced/kiosk" },
          ],
        },
      ],

      socialLinks: [
        { icon: "github", link: "https://github.com/oktomusic/oktomusic" },
        { icon: "x", link: "https://x.com/OktomusicDev" },
        { icon: "youtube", link: "https://www.youtube.com/@OktomusicDev" },
        { icon: "reddit", link: "https://www.reddit.com/r/oktomusic" },
      ],

      search: {
        provider: "local",
      },

      editLink: {
        pattern:
          "https://github.com/oktomusic/oktomusic/tree/master/apps/website/docs/:path",
      },
    },
    lastUpdated: process.env.VITEPRESS_HOSTNAME ? true : false,
    cleanUrls: true,
    sitemap: process.env.VITEPRESS_HOSTNAME
      ? {
          hostname: process.env.VITEPRESS_HOSTNAME!,
        }
      : undefined,
    vite: {
      server: {
        port: 5174,
      },
      plugins: [
        llmstxt({
          title: "Oktomusic Documentation",
          generateLLMsTxt: true,
          generateLLMsFullTxt: true,
          injectLLMHint: true,
          stripHTML: true,
        }),
      ],
    },
    pwa: {
      // mode: "production",
      registerType: "autoUpdate",
      injectRegister: "script-defer",
      includeAssets: ["favicon.svg"],
      outDir: "../.vitepress/dist",
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico,txt,md,woff2}"],
      },
      experimental: {
        includeAllowlist: true,
      },
      manifest: {
        id: "dev.afcms.oktomusic",
        name: "Oktomusic Documentation",
        short_name: "Oktomusic Docs",
        description: "Documentation for Oktomusic, a media server",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#42b883",
        lang: "en",
        scope: "/",
        categories: [],
        dir: "ltr",
        display_override: [],
        edge_side_panel: {
          preferred_width: 400,
        },
        orientation: "natural",
        shortcuts: [
          {
            name: "Get Started",
            short_name: "Get Started",
            description: "Learn how to get started with Oktomusic",
            url: "/guide/installation",
          },
          {
            name: "FAQ",
            short_name: "FAQ",
            description: "Frequently Asked Questions about Oktomusic",
            url: "/guide/faq",
          },
        ],
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      pwaAssets: {
        disabled: true,
      },
      devOptions: {
        enabled: true,
        suppressWarnings: true,
        navigateFallback: "/",
      },
    },
  }),
);
