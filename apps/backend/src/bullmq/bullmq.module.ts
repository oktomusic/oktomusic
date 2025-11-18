import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";
import type { RedisClient } from "bullmq";

import type { ValkeyConfig } from "../config/definitions/valkey.config";
import { IndexingModule } from "./queues/indexing/indexing.module";

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
            maxRetriesPerRequest: null,
          }) as unknown as RedisClient,
        };
      },
    }),
    IndexingModule,
  ],
  exports: [BullModule, IndexingModule],
})
export class BullmqModule {}
