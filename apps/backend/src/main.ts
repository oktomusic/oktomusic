import path from "node:path";
import type { Response } from "express";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { buildViewModel } from "./views/view-model";
import { OpenGraphService } from "./common/opengraph/opengraph.service";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .setTitle("Oktomusic")
    .setLicense(
      "AGPL-3.0-only",
      "https://www.gnu.org/licenses/agpl-3.0.en.html",
    )
    .setDescription("Oktomusic API")
    .setVersion("0.0.1")
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, documentFactory);

  app.enableShutdownHooks();
  // Configure Handlebars view engine
  app.setBaseViewsDir(path.join(__dirname, "views"));
  app.setViewEngine("hbs");

  // Serve static assets from the public directory at the base path
  app.useStaticAssets(path.join(__dirname, "public"), {
    index: false,
    redirect: false,
  });

  // Fallback: render the main view for any non-API route not matched by static assets
  const server = app.getHttpAdapter().getInstance();
  const og = app.get(OpenGraphService);
  server.get(/^\/(?!api\b).*/, (_req: unknown, res: Response) => {
    res.render("index", buildViewModel({ ogp: og.getDefaultTags() }));
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
