import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";
import type { RedisClient } from "bullmq";
import Redis from "valkey-glide-ioredis-adapter";

import type { ValkeyConfig } from "../config/definitions/valkey.config";
import { IndexingModule } from "./queues/indexing/indexing.module";

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { valkeyHost, valkeyPort, valkeyPassword } =
          configService.getOrThrow<ValkeyConfig>("valkey");

        const redisOptions: Record<string, unknown> = {
          host: valkeyHost,
          port: valkeyPort,
          maxRetriesPerRequest: null,
        };

        // Only add password if it's set (not null/undefined)
        if (valkeyPassword) {
          redisOptions.password = valkeyPassword;
        }

        return {
          connection: new Redis(redisOptions) as unknown as RedisClient,
        };
      },
    }),
    IndexingModule,
  ],
  exports: [BullModule, IndexingModule],
})
export class BullmqModule {}
