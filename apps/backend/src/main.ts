import path from "node:path";
import fs from "node:fs";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { Request, Response, NextFunction } from "express";

import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { loadManifest, type ViteManifest } from "./utils/vite_manifest";

import { registerViteAssetTagsHelper } from "./views/helpers/viteAssetTags.helper";
import { registerAssetHelper } from "./views/helpers/asset.helper";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Oktomusic")
    .setLicense(
      "AGPL-3.0-only",
      "https://www.gnu.org/licenses/agpl-3.0.en.html",
    )
    .setDescription("Oktomusic API")
    .setVersion("0.0.1")
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, documentFactory);

  app.enableShutdownHooks();
  // Configure Handlebars view engine
  app.setBaseViewsDir(path.join(__dirname, "views"));
  app.setViewEngine("hbs");

  const configService = app.get(ConfigService);
  const isDev = Boolean(configService.get("app.isDev"));
  const viteOrigin = configService.get<string | undefined>("vite.origin");

  // Load Vite manifest in production mode
  let viteManifest: ViteManifest | null = null;
  if (!isDev) {
    const manifestCandidates = [
      path.resolve(__dirname, "../../frontend/dist/.vite/manifest.json"),
      path.join(__dirname, "public/.vite/manifest.json"),
    ];
    for (const manifestPath of manifestCandidates) {
      viteManifest = loadManifest(manifestPath);
      if (viteManifest) break;
    }
  }

  // Register Handlebars helpers
  registerViteAssetTagsHelper();
  registerAssetHelper({ isDev, viteOrigin });

  if (!isDev) {
    const candidates = [
      path.resolve(__dirname, "../../frontend/dist"),
      path.join(__dirname, "public"),
    ];
    for (const dir of candidates) {
      if (fs.existsSync(dir)) {
        app.useStaticAssets(dir, { index: false, redirect: false });
      }
    }
  }

  // Make viteManifest available to controllers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.viteManifest = viteManifest;
    next();
  });

  const port = Number(configService.get("http.port") ?? 3000);
  await app.listen(port);
}
void bootstrap();
