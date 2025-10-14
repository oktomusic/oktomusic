import path from "node:path";
import fs from "node:fs";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import hbs from "hbs";

import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";

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

  // Register a Handlebars helper to prefix asset URLs with the Vite origin in development
  hbs.registerHelper("asset", (p: unknown) => {
    if (typeof p !== "string" || !p) return "";
    // Absolute URL? return as-is
    if (/^https?:\/\//i.test(p)) return p;
    // Avoid prefixing API routes
    if (p.startsWith("/api")) return p;
    if (isDev && viteOrigin) {
      const pathname = p.startsWith("/") ? p : `/${p}`;
      try {
        return new URL(pathname, viteOrigin).toString();
      } catch {
        return `${viteOrigin}${pathname}`;
      }
    }
    return p;
  });

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

  const port = Number(configService.get("http.port") ?? 3000);
  await app.listen(port);
}
void bootstrap();
