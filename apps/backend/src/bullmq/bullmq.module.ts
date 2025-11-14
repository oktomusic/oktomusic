import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";
import type { RedisClient } from "bullmq";
import Redis from "valkey-glide-ioredis-adapter";

import type { ValkeyConfig } from "../config/definitions/valkey.config";

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { valkeyHost, valkeyPort, valkeyPassword } =
          configService.getOrThrow<ValkeyConfig>("valkey");

        return {
          connection: new Redis({
            host: valkeyHost,
            port: valkeyPort,
            password: valkeyPassword ?? undefined,
          }) as unknown as RedisClient,
        };
      },
    }),
  ],
  exports: [BullModule],
})
export class BullmqModule {}
