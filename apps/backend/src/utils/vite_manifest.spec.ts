import { describe, expect, it } from "vitest";

import { getAssetTags, type ViteManifest } from "./vite_manifest";

describe("getAssetTags", () => {
  it("includes static and dynamic imports in head preloads with SRI", () => {
    const manifest: ViteManifest = {
      "src/main.tsx": {
        file: "assets/main.js",
        isEntry: true,
        imports: ["_shared.js"],
        dynamicImports: ["src/locales/en/messages.po"],
        css: ["assets/main.css"],
        sri: "sha512-main",
      },
      "_shared.js": {
        file: "assets/shared.js",
        sri: "sha512-shared",
      },
      "src/locales/en/messages.po": {
        file: "assets/messages.js",
        imports: ["_shared.js"],
        sri: "sha512-messages",
      },
      "assets/main.css": {
        file: "assets/main.css",
        sri: "sha512-css",
      },
    };

    const assetTags = getAssetTags(manifest, "src/main.tsx");

    expect(assetTags.head).toEqual([
      {
        tag: "link",
        attrs: {
          rel: "modulepreload",
          href: "/assets/shared.js",
          integrity: "sha512-shared",
          crossorigin: true,
        },
      },
      {
        tag: "link",
        attrs: {
          rel: "modulepreload",
          href: "/assets/messages.js",
          integrity: "sha512-messages",
          crossorigin: true,
        },
      },
      {
        tag: "link",
        attrs: {
          rel: "stylesheet",
          href: "/assets/main.css",
          integrity: "sha512-css",
          crossorigin: true,
        },
      },
    ]);

    expect(assetTags.body).toEqual([
      {
        tag: "script",
        attrs: {
          type: "module",
          src: "/assets/main.js",
          integrity: "sha512-main",
          crossorigin: true,
        },
      },
    ]);
  });
});
