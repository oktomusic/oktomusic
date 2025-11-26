import { defineConfig } from "vitepress";

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
        ],
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
});
