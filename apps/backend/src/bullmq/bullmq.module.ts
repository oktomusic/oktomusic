import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";
import type { ConnectionOptions } from "bullmq";
// import Redis from "valkey-glide-ioredis-adapter";
import Valkey from "iovalkey";

import type { ValkeyConfig } from "../config/definitions/valkey.config";
import { PrismaModule } from "../db/prisma.module";
import { BullmqService } from "./bullmq.service";
import { IndexingProcessor } from "./processors/indexing.processor";
import { NativeModule } from "src/native/native.module";

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { valkeyHost, valkeyPort, valkeyPassword } =
          configService.getOrThrow<ValkeyConfig>("valkey");

        return {
          connection: new Valkey({
            host: valkeyHost,
            port: valkeyPort,
            password: valkeyPassword ?? undefined,
            maxRetriesPerRequest: null,
          }) as unknown as ConnectionOptions,
        };
      },
    }),
    BullModule.registerQueue({
      name: "library-indexing",
    }),
    PrismaModule,
    NativeModule,
  ],
  exports: [BullModule, BullmqService],
  providers: [BullmqService, IndexingProcessor],
})
export class BullmqModule {}
