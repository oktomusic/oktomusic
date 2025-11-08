import { Inject, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import session from "express-session";

import appConfig from "../config/definitions/app.config";

@Module({})
export class SessionModule implements NestModule {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConf: ConfigType<typeof appConfig>,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const sessionSecret = this.appConf.sessionSecret;

    const store: session.Store = new session.MemoryStore();

    consumer
      .apply(
        session({
          store,
          secret: sessionSecret,
          resave: false,
          saveUninitialized: false,
          rolling: true, // Extend session on each request
          cookie: {
            secure: this.appConf.isProd,
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
          },
        }),
      )
      .forRoutes("*");
  }
}
