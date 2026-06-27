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
    const existingJob = await this.getCurrentIndexingJob();

    if (existingJob) {
      return existingJob;
    }

    const now = new Date().toISOString();
    const job = await this.indexingQueue.add("index", {
      warnings: [],
      reports: [],
      steps: [],
      startedAt: now,
      updatedAt: now,
    });

    return job;
  }

  async getJobStatus(jobId: string): Promise<Job<IndexingJobData> | undefined> {
    const job = await this.indexingQueue.getJob(jobId);
    return job ?? undefined;
  }

  async getCurrentIndexingJob(): Promise<Job<IndexingJobData> | undefined> {
    const jobs = await this.indexingQueue.getJobs(
      ["active", "waiting", "delayed", "prioritized", "waiting-children"],
      0,
      -1,
      false,
    );

    return this.pickLatestJob(jobs);
  }

  async getLatestIndexingJob(): Promise<Job<IndexingJobData> | undefined> {
    const currentJob = await this.getCurrentIndexingJob();

    if (currentJob) {
      return currentJob;
    }

    const jobs = await this.indexingQueue.getJobs(
      ["completed", "failed"],
      0,
      -1,
      false,
    );

    return this.pickLatestJob(jobs);
  }

  private pickLatestJob(
    jobs: Job<IndexingJobData>[],
  ): Job<IndexingJobData> | undefined {
    return jobs
      .toSorted((left, right) => {
        const leftTime = left.finishedOn ?? left.processedOn ?? left.timestamp;
        const rightTime =
          right.finishedOn ?? right.processedOn ?? right.timestamp;

        return rightTime - leftTime;
      })
      .at(0);
  }
}
