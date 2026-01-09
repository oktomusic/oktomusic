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
          { text: "Configuration", link: "/guide/configuration" },
          { text: "Music Collection", link: "/guide/music-collection" },
          { text: "FAQ", link: "/guide/faq" },
        ],
      },
      {
        text: "Advanced",
        items: [{ text: "Auth", link: "/auth" }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/oktomusic/oktomusic" },
      { icon: "x", link: "https://x.com/OktomusicDev" },
    ],
  },
  cleanUrls: true,
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
