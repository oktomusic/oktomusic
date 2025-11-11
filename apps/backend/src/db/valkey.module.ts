import { Module } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { GlideClient } from "@valkey/valkey-glide";

import valkeyConfig from "src/config/definitions/valkey.config";
import { ValkeyService } from "./valkey.service";

export const VALKEY_CLIENT = Symbol("VALKEY_CLIENT");

@Module({
  providers: [
    {
      provide: VALKEY_CLIENT,
      inject: [valkeyConfig.KEY],
      useFactory: async (conf: ConfigType<typeof valkeyConfig>) => {
        return GlideClient.createClient({
          addresses: [
            {
              host: conf.valkeyHost,
              port: conf.valkeyPort,
            },
          ],
          ...(conf.valkeyPassword
            ? { credentials: { password: conf.valkeyPassword } }
            : {}),
        });
      },
    },
    {
      provide: ValkeyService,
      inject: [VALKEY_CLIENT],
      useFactory: (client: GlideClient) => new ValkeyService(client),
    },
  ],
  exports: [ValkeyService],
})
export class ValkeyModule {}
