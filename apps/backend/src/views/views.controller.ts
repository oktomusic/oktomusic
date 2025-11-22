import { Controller, Get, Req, Res, Next, Inject } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import type { NextFunction, Request, Response } from "express";

import { buildViewModel } from "./view-model";
import { OpenGraphService } from "../common/opengraph/opengraph.service";
import { getAssetTags, type ViteManifest } from "../utils/vite_manifest";
import viteConfig, { type ViteConfig } from "../config/definitions/vite.config";
import appConfig, { type AppConfig } from "src/config/definitions/app.config";

@Controller()
export class ViewsController {
  constructor(
    private readonly og: OpenGraphService,
    @Inject(appConfig.KEY)
    private readonly appConf: AppConfig,
    @Inject(viteConfig.KEY)
    private readonly viteConf: ViteConfig,
  ) {}

  @Get("/manifest.webmanifest")
  manifest(): Partial<ManifestOptions> {
    const isDev = this.appConf.isDev;
    const viteOrigin = this.viteConf.origin;

    const devUrl = (p: string) => {
      return isDev ? `${viteOrigin}/${p}` : p;
    };

    return {
      name: "Oktomusic",
      short_name: "Oktomusic",
      description: "Your personal music streaming server",
      categories: ["music", "entertainment"],
      start_url: "/",
      display: "standalone",
      display_override: ["window-controls-overlay"],
      background_color: "#ffffff",
      theme_color: "#000000",
      lang: "en",
      dir: "ltr",
      scope: "/",
      icons: [
        {
          src: devUrl("pwa-64x64.png"),
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: devUrl("pwa-192x192.png"),
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: devUrl("pwa-512x512.png"),
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: devUrl("maskable-icon-512x512.png"),
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      shortcuts: [
        {
          name: "Player",
          url: "/player",
        },
        {
          name: "App Info",
          url: "/appinfo",
        },
      ],
    };
  }

  @Get("*")
  @ApiOperation({
    summary: "Serve SPA",
    description:
      "Serves the Single Page Application with appropriate Open Graph tags. Further routing is handled client-side by react-router.",
  })
  spa(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    if (req.path.startsWith("/api")) {
      return next();
    }

    const viteManifest = res.locals.viteManifest as ViteManifest | null;
    const assetTags = viteManifest
      ? getAssetTags(viteManifest, "src/main.tsx")
      : undefined;

    res.render(
      "index",
      buildViewModel({
        ogp: this.og.getDefaultTags(),
        assetTags,
      }),
    );
  }
}
