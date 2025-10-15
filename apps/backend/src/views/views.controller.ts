import { Controller, Get, Render, Res } from "@nestjs/common";
import type { Response } from "express";
import { buildViewModel } from "./view-model";
import { OpenGraphService } from "../common/opengraph/opengraph.service";
import { getAssetTags, type ViteManifest } from "../utils/vite_manifest";

@Controller()
export class ViewsController {
  constructor(private readonly og: OpenGraphService) {}
  @Get()
  @Render("index")
  home(@Res({ passthrough: true }) res: Response) {
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
