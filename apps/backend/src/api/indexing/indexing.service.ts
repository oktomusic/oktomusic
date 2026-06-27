import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import type { Job } from "bullmq";
import { PubSub } from "graphql-subscriptions";

import { BullmqService } from "../../bullmq/bullmq.service";
import type { IndexingJobData } from "../../bullmq/processors/errors";
import { PUB_SUB } from "../../common/pubsub/pubsub.module";
import { Prisma } from "../../generated/prisma/client";
import { PrismaService } from "../../db/prisma.service";
import {
  IndexingJobModel,
  IndexingJobStatus,
  IndexingLibraryStatsModel,
  IndexingOverviewModel,
  IndexingReportItemModel,
} from "./indexing.model";
import { INDEXING_JOB_UPDATED } from "./indexing.constants";

@Injectable()
export class IndexingService {
  constructor(
    private readonly bullmqService: BullmqService,
    private readonly prisma: PrismaService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async triggerIndexing(): Promise<IndexingJobModel> {
    const job = await this.bullmqService.triggerIndexing();

    const state = await job.getState();
    const status = this.mapJobStateToStatus(state);

    const jobModel = this.buildJobModel(job, status);

    // Publish the initial job status
    await this.pubSub.publish(INDEXING_JOB_UPDATED, {
      indexingJobUpdated: jobModel,
    });

    return jobModel;
  }

  async getOverview(): Promise<IndexingOverviewModel> {
    const [latestJob, libraryStats] = await Promise.all([
      this.bullmqService.getLatestIndexingJob(),
      this.getLibraryStats(),
    ]);

    if (!latestJob) {
      return {
        latestJob: undefined,
        libraryStats,
      };
    }

    const state = await latestJob.getState();
    const status = this.mapJobStateToStatus(state);

    return {
      latestJob: this.buildJobModel(latestJob, status),
      libraryStats,
    };
  }

  async getJobStatus(jobId: string): Promise<IndexingJobModel> {
    const job = await this.bullmqService.getJobStatus(jobId);

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    const state = await job.getState();
    const status = this.mapJobStateToStatus(state);

    return this.buildJobModel(job, status);
  }

  private mapJobStateToStatus(state: string): IndexingJobStatus {
    switch (state) {
      case "waiting":
      case "delayed":
      case "prioritized":
      case "waiting-children":
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

  private buildJobModel(
    job: Job<IndexingJobData>,
    status: IndexingJobStatus,
  ): IndexingJobModel {
    const updatedAtValue =
      job.data?.updatedAt ??
      (job.finishedOn
        ? new Date(job.finishedOn).toISOString()
        : job.processedOn
          ? new Date(job.processedOn).toISOString()
          : undefined);
    const startedAtValue =
      job.data?.startedAt ??
      (job.processedOn ? new Date(job.processedOn).toISOString() : undefined);

    return {
      jobId: job.id ?? "unknown",
      status,
      progress: typeof job.progress === "number" ? job.progress : undefined,
      startedAt: this.toOptionalDate(startedAtValue),
      updatedAt: this.toOptionalDate(updatedAtValue),
      error: job.failedReason,
      completedAt: job.finishedOn
        ? this.toOptionalDate(job.finishedOn)
        : undefined,
      steps: job.data?.steps ?? [],
      reports: this.buildReportModels(job.data?.reports ?? []),
      warnings: job.data?.warnings ?? [],
    };
  }

  private async getLibraryStats(): Promise<IndexingLibraryStatsModel> {
    const [
      usersCount,
      artistsCount,
      albumsCount,
      tracksCount,
      flacFilesCount,
      tracksWithLyricsCount,
      playlistsCount,
      playlistTracksCount,
      savedLibraryItemsCount,
      playHistoryItemsCount,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.artist.count(),
      this.prisma.album.count(),
      this.prisma.track.count(),
      this.prisma.flacFile.count(),
      this.prisma.track.count({
        where: {
          lyrics: {
            not: Prisma.JsonNull,
          },
        },
      }),
      this.prisma.playlist.count(),
      this.prisma.playlistTrack.count(),
      this.prisma.userLibraryItem.count(),
      this.prisma.userItemPlayHistory.count(),
    ]);

    return {
      generatedAt: new Date(),
      usersCount,
      artistsCount,
      albumsCount,
      tracksCount,
      flacFilesCount,
      tracksWithLyricsCount,
      playlistsCount,
      playlistTracksCount,
      savedLibraryItemsCount,
      playHistoryItemsCount,
    };
  }

  private buildReportModels(
    reports: NonNullable<IndexingJobData["reports"]>,
  ): IndexingReportItemModel[] {
    return reports.map((report) => ({
      ...report,
      emittedAt: this.toDate(report.emittedAt),
    }));
  }

  private toOptionalDate(
    value: number | string | Date | undefined,
  ): Date | undefined {
    if (value === undefined) {
      return undefined;
    }

    return this.toDate(value);
  }

  private toDate(value: number | string | Date): Date {
    if (value instanceof Date) {
      return value;
    }

    return new Date(value);
  }
}
