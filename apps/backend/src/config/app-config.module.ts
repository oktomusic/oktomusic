import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";

import appConfig from "./definitions/app.config";
import httpConfig from "./definitions/http.config";
import viteConfig from "./definitions/vite.config";
import oidcConfig from "./definitions/oidc.config";

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [
        ".env",
        ".env.local",
        "apps/backend/.env",
        "apps/backend/.env.local",
      ],
      load: [appConfig, httpConfig, oidcConfig, viteConfig],
    }),
  ],
  exports: [NestConfigModule],
})
export class AppConfigModule {}
