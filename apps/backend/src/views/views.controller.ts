import { Controller, Get, Req, Res, Next } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import type { NextFunction, Request, Response } from "express";

import { buildViewModel } from "./view-model";
import { OpenGraphService } from "../common/opengraph/opengraph.service";
import { getAssetTags, type ViteManifest } from "../utils/vite_manifest";

@Controller()
export class ViewsController {
  constructor(private readonly og: OpenGraphService) {}

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
