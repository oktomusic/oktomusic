import { Controller, Get, Next, Render, Req, Res } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import type { Request, Response, NextFunction } from "express";

import { buildViewModel } from "./view-model";
import { OpenGraphService } from "../common/opengraph/opengraph.service";
import { getAssetTags, type ViteManifest } from "../utils/vite_manifest";

@Controller()
export class ViewsController {
  constructor(private readonly og: OpenGraphService) {}

  @Get("*")
  @Render("index")
  @ApiOperation({
    summary: "Serve SPA",
    description:
      "Serves the Single Page Application with appropriate Open Graph tags. Further routing is handled client-side by react-router.",
  })
  spa(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Next() next: NextFunction,
  ) {
    // Skip rendering for /api routes - let them be handled by their respective controllers
    if (req.path.startsWith("/api")) {
      return next();
    }

    const viteManifest = res.locals.viteManifest as ViteManifest | null;
    const assetTags = viteManifest
      ? getAssetTags(viteManifest, "src/main.tsx")
      : undefined;

    return buildViewModel({
      ogp: this.og.getDefaultTags(),
      assetTags,
    });
  }
}
