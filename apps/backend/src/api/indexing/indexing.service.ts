import { Injectable, NotFoundException } from "@nestjs/common";

import type { IndexingTriggerRes, IndexingStatusRes } from "@oktomusic/api-schemas";

import { BullmqService } from "../../bullmq/bullmq.service";

@Injectable()
export class IndexingService {
  constructor(private readonly bullmqService: BullmqService) {}

  async triggerIndexing(): Promise<IndexingTriggerRes> {
    const job = await this.bullmqService.triggerIndexing();
    
    const state = await job.getState();
    const status = this.mapJobStateToStatus(state);

    return {
      jobId: job.id ?? "unknown",
      status,
    };
  }

  async getJobStatus(jobId: string): Promise<IndexingStatusRes> {
    const job = await this.bullmqService.getJobStatus(jobId);

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    const state = await job.getState();
    const status = this.mapJobStateToStatus(state);

    return {
      jobId: job.id ?? "unknown",
      status,
      progress: typeof job.progress === "number" ? job.progress : undefined,
      error: job.failedReason,
      completedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : undefined,
    };
  }

  private mapJobStateToStatus(
    state: string,
  ): "queued" | "active" | "completed" | "failed" {
    switch (state) {
      case "waiting":
      case "delayed":
        return "queued";
      case "active":
        return "active";
      case "completed":
        return "completed";
      case "failed":
        return "failed";
      default:
        return "queued";
    }
  }
}
