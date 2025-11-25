import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";

import { BullmqService } from "../../bullmq/bullmq.service";
import { PUB_SUB } from "../../common/pubsub/pubsub.module";
import { IndexingJobModel, IndexingJobStatus } from "./indexing.model";
import { INDEXING_JOB_UPDATED } from "./indexing.constants";

@Injectable()
export class IndexingService {
  constructor(
    private readonly bullmqService: BullmqService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async triggerIndexing(): Promise<IndexingJobModel> {
    const job = await this.bullmqService.triggerIndexing();
    
    const state = await job.getState();
    const status = this.mapJobStateToStatus(state);

    const jobModel: IndexingJobModel = {
      jobId: job.id ?? "unknown",
      status,
    };

    // Publish the initial job status
    await this.pubSub.publish(INDEXING_JOB_UPDATED, {
      indexingJobUpdated: jobModel,
    });

    return jobModel;
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
