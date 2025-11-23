import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";

import { IndexingProcessor } from "./indexing.processor";
import { IndexingService } from "./indexing.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "indexing",
    }),
  ],
  providers: [IndexingProcessor, IndexingService],
  exports: [IndexingService],
})
export class IndexingModule {}
