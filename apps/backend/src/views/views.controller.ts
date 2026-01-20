import {
  Controller,
  Get,
  Req,
  Res,
  Next,
  Inject,
  Header,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiProduces } from "@nestjs/swagger";
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
  @Header("Cache-Control", "public, max-age=0, s-maxage=0, must-revalidate")
  @ApiOperation({
    summary: "Get Web App Manifest",
    description:
      "Returns the Web App Manifest for PWA support. Customised based on configuration.",
  })
  @ApiOkResponse({
    description:
      "Manifest JSON used by browsers to install the Oktomusic Progressive Web App.",
  })
  manifest(): Partial<ManifestOptions> {
    const isDev = this.appConf.isDev;
    const viteOrigin = this.viteConf.origin;

    const devUrl = (p: string) => {
      return isDev ? `${viteOrigin}/${p}` : p;
    };

    return {
      name: "Oktomusic" + (isDev ? " (Dev)" : ""),
      short_name: "Oktomusic" + (isDev ? " (Dev)" : ""),
      description: "Your personal music streaming server",
      categories: ["music", "entertainment"],
      start_url: "/",
      display: "standalone",
      display_override: ["window-controls-overlay"],
      background_color: "#000000",
      theme_color: "#000000",
      lang: "en",
      orientation: "natural",
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
      launch_handler: {
        client_mode: "navigate-existing",
      },
    };
  }

  @Get("/robots.txt")
  @ApiOperation({
    summary: "Get robots.txt",
    description: "Returns the robots.txt file to disallow all web crawlers.",
  })
  @ApiProduces("text/plain")
  @ApiOkResponse({
    description: "Plain-text rules instructing crawlers to avoid every path.",
    schema: {
      type: "string",
      example: "User-agent: *\nDisallow: /\n",
    },
  })
  robots(@Res() res: Response) {
    res.type("text/plain");
    res.send("User-agent: *\nDisallow: /\n");
  }

  @Get("*")
  @Header("Cache-Control", "public, max-age=0, s-maxage=0, must-revalidate")
  @ApiOperation({
    summary: "Serve SPA",
    description:
      "Serves the Single Page Application with appropriate Open Graph tags. Further routing is handled client-side by react-router.",
  })
  @ApiProduces("text/html")
  @ApiOkResponse({
    description: "HTML entrypoint that bootstraps the Oktomusic SPA.",
  })
  spa(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    // Hack for GraphQL Playground
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
