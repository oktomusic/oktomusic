import { Inject, Logger } from "@nestjs/common";
import { type ConfigType } from "@nestjs/config";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { PubSub } from "graphql-subscriptions";

import appConfig from "../../config/definitions/app.config";
import { PrismaService } from "../../db/prisma.service";
import { PUB_SUB } from "../../common/pubsub/pubsub.module";
import { INDEXING_JOB_UPDATED } from "../../api/indexing/indexing.constants";

@Processor("library_indexing")
export class IndexingProcessor extends WorkerHost {
  private readonly logger = new Logger(IndexingProcessor.name);

  constructor(
    private prisma: PrismaService,
    @Inject(appConfig.KEY)
    private readonly appConf: ConfigType<typeof appConfig>,
    @Inject(PUB_SUB)
    private readonly pubSub: PubSub,
  ) {
    super();
  }

  async process(job: Job) {
    const libraryPath = this.appConf.libraryPath;

    this.logger.log(`Processing job ${job.id} - libraryPath: ${libraryPath}`);

    // Publish initial active status
    await this.publishJobStatus(job, "active", 0);

    // Simulate work with progress updates (10 second delay with progress)
    const totalSteps = 10;
    for (let i = 1; i <= totalSteps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const progress = Math.round((i / totalSteps) * 100);
      await job.updateProgress(progress);
      await this.publishJobStatus(job, "active", progress);
      this.logger.log(`Job ${job.id} progress: ${progress}%`);
    }

    this.logger.log(`Completed job ${job.id}`);

    // Publish completed status
    await this.publishJobStatus(job, "completed", 100);

    return { ok: true };
  }

  private async publishJobStatus(
    job: Job,
    status: "queued" | "active" | "completed" | "failed",
    progress: number,
  ) {
    await this.pubSub.publish(INDEXING_JOB_UPDATED, {
      indexingJobUpdated: {
        jobId: job.id,
        status,
        progress,
        error: job.failedReason,
        completedAt:
          status === "completed" ? new Date().toISOString() : undefined,
      },
    });
  }
}
