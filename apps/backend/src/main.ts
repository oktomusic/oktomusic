import path from "node:path";
import fs from "node:fs";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import { AppModule } from "./app.module";
import { loadManifest, type ViteManifest } from "./utils/vite_manifest";

import { registerViteAssetTagsHelper } from "./views/helpers/viteAssetTags.helper";
import { registerAssetHelper } from "./views/helpers/asset.helper";
import { AppConfig } from "./config/definitions/app.config";
import { HttpConfig } from "./config/definitions/http.config";
import { ViteConfig } from "./config/definitions/vite.config";
import { getHelmetConfig } from "./utils/helmet_config";
import { permissionsPolicyMiddleware } from "./utils/permissions_policy";
import { proxyMiddleware, vitePrefixes } from "./utils/vite_dev_proxy";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Get Configuration
  const configService = app.get(ConfigService);
  const trustProxy = configService.getOrThrow<HttpConfig>("http").trustProxy;
  const isDev = configService.getOrThrow<AppConfig>("app").isDev;
  const viteOrigin = configService.getOrThrow<ViteConfig>("vite").origin;

  // Required when running behind a reverse proxy (so req.protocol/req.secure are correct)
  app.set("trust proxy", trustProxy);

  // Enable cookie parser
  app.use(cookieParser());

  // Use helmet for security headers
  app.use(helmet(getHelmetConfig(isDev, viteOrigin)));

  // Apply Permissions Policy
  app.use(permissionsPolicyMiddleware);

  if (isDev) {
    app.use(proxyMiddleware(viteOrigin, vitePrefixes));
  }

  // Setup Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Oktomusic")
    .setLicense(
      "AGPL-3.0-only",
      "https://www.gnu.org/licenses/agpl-3.0.en.html",
    )
    .setDescription("Oktomusic API")
    .setVersion("0.0.1")
    .setOpenAPIVersion("3.1.0")
    .addSecurity("session", {
      type: "apiKey",
      in: "cookie",
      name: "connect.sid",
    })
    .setExternalDoc("GraphQL Playground", "/api/graphql");

  const document = SwaggerModule.createDocument(app, swaggerConfig.build());
  SwaggerModule.setup("api/docs", app, document, {
    ui: isDev,
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.enableCors({ origin: false });
  app.enableShutdownHooks();
  // Configure Handlebars view engine
  app.setBaseViewsDir(path.join(__dirname, "views"));
  app.setViewEngine("hbs");

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

  const port = configService.getOrThrow<HttpConfig>("http").port;

  await app.listen(port);
}
void bootstrap();
