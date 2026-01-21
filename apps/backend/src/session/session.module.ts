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
import httpConfig from "../config/definitions/http.config";
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
    @Inject(httpConfig.KEY)
    private readonly httpConf: ConfigType<typeof httpConfig>,
    @Optional() private readonly valkeyService?: ValkeyService,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const sessionSecret = this.appConf.sessionSecret;
    const trustProxy = this.httpConf.trustProxy;
    const store: session.Store =
      useValkeyStore && this.valkeyService
        ? new ValkeyStore(this.valkeyService.getClient())
        : new session.MemoryStore();

    consumer
      .apply(
        session({
          store,
          secret: sessionSecret,
          proxy: trustProxy,
          resave: false,
          saveUninitialized: false,
          rolling: true, // Extend session on each request
          cookie: {
            // Behind a reverse proxy, Express needs trust proxy to correctly infer req.secure.
            // Using "auto" avoids breaking non-TLS deployments while still marking cookies Secure on HTTPS.
            secure: this.appConf.isProd ? "auto" : false,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
          },
        }),
      )
      .forRoutes("*");
  }
}
