import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Job, Queue } from "bullmq";

import type { IndexingJobData } from "./processors/errors";

@Injectable()
export class BullmqService {
  constructor(
    @InjectQueue("library-indexing")
    private readonly indexingQueue: Queue<IndexingJobData>,
  ) {}

  async triggerIndexing(): Promise<Job<IndexingJobData>> {
    const job = await this.indexingQueue.add("index", { warnings: [] });
    return job;
  }

  async getJobStatus(jobId: string): Promise<Job<IndexingJobData> | undefined> {
    const job = await this.indexingQueue.getJob(jobId);
    return job ?? undefined;
  }
}
