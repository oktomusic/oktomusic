import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";

import type { ConnectionOptions } from "bullmq";
import { Redis } from "iovalkey";

import type { ValkeyConfig } from "../config/definitions/valkey.config";

import { LibraryScanProcessor } from "./processors/library-scan.processor";

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
          }) as unknown as ConnectionOptions,
        };
      },
    }),
    BullModule.registerQueue({
      name: "library-scan",
    }),
  ],
  providers: [LibraryScanProcessor],
  exports: [BullModule],
})
export class BullmqModule {}
