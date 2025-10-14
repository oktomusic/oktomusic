import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";

import { EnvSchema } from "./env.schema";
import appConfig from "./definitions/app.config";
import httpConfig from "./definitions/http.config";
import viteConfig from "./definitions/vite.config";

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
      load: [appConfig, httpConfig, viteConfig],
      validate: (env: Record<string, unknown>) => {
        const parsed = EnvSchema.safeParse(env);
        if (!parsed.success) {
          const issues = parsed.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ");
          throw new Error(`Invalid environment configuration: ${issues}`);
        }
        return parsed.data;
      },
    }),
  ],
  exports: [NestConfigModule],
})
export class AppConfigModule {}
