import { Injectable, NotFoundException } from "@nestjs/common";

import { BullmqService } from "../../bullmq/bullmq.service";
import { IndexingJobModel, IndexingJobStatus } from "./indexing.model";

@Injectable()
export class IndexingService {
  constructor(private readonly bullmqService: BullmqService) {}

  async triggerIndexing(): Promise<IndexingJobModel> {
    const job = await this.bullmqService.triggerIndexing();
    
    const state = await job.getState();
    const status = this.mapJobStateToStatus(state);

    return {
      jobId: job.id ?? "unknown",
      status,
    };
  }

  async getJobStatus(jobId: string): Promise<IndexingJobModel> {
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

  private mapJobStateToStatus(state: string): IndexingJobStatus {
    switch (state) {
      case "waiting":
      case "delayed":
        return IndexingJobStatus.QUEUED;
      case "active":
        return IndexingJobStatus.ACTIVE;
      case "completed":
        return IndexingJobStatus.COMPLETED;
      case "failed":
        return IndexingJobStatus.FAILED;
      default:
        return IndexingJobStatus.QUEUED;
    }
  }
}
