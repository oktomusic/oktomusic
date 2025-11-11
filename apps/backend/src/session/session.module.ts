import {
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  Optional,
} from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import session from "express-session";

import appConfig from "../config/definitions/app.config";
import { ValkeyModule } from "../db/valkey.module";
import { ValkeyService } from "../db/valkey.service";

import { ValkeyStore } from "./valkey-store";

// Toggle whether sessions are stored in Valkey via Glide or in-memory.
// In production you typically want Valkey enabled for horizontal scalability.
const useValkeyStore = true;

@Module({ imports: useValkeyStore ? [ValkeyModule] : [] })
export class SessionModule implements NestModule {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConf: ConfigType<typeof appConfig>,
    @Optional() private readonly valkeyService?: ValkeyService,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const sessionSecret = this.appConf.sessionSecret;
    const store: session.Store =
      useValkeyStore && this.valkeyService
        ? new ValkeyStore(this.valkeyService.getClient())
        : new session.MemoryStore();

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
