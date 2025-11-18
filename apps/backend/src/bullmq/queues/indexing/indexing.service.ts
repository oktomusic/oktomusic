import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import type { Queue } from "bullmq";

import type { IndexingJobData } from "./indexing.processor";

@Injectable()
export class IndexingService implements OnModuleInit {
  private readonly logger = new Logger(IndexingService.name);

  constructor(@InjectQueue("indexing") private indexingQueue: Queue<IndexingJobData>) {}

  onModuleInit() {
    // Add an initial indexing job when the module starts (don't await to avoid blocking)
    this.addFullIndexingJob().catch((error) => {
      this.logger.error(`Failed to add initial indexing job: ${error}`);
    });
  }

  async addFullIndexingJob(): Promise<void> {
    this.logger.log("Adding full indexing job to queue");
    
    await this.indexingQueue.add(
      "full-index",
      { type: "full" },
      {
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
    
    this.logger.log("Full indexing job added successfully");
  }

  async addPartialIndexingJob(): Promise<void> {
    this.logger.log("Adding partial indexing job to queue");
    
    await this.indexingQueue.add(
      "partial-index",
      { type: "partial" },
      {
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
    
    this.logger.log("Partial indexing job added successfully");
  }
}
