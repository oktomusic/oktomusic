import { defineConfig } from "vitepress";
import llmstxt from "vitepress-plugin-llms";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",

  title: "Oktomusic",
  description: "A media server",
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
          { text: "Configuration Reference", link: "/advanced/configuration" },
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
    }
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
});
