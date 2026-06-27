import type { Job } from "bullmq";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BullmqService } from "../../bullmq/bullmq.service";
import {
  IndexingProgressStepKey,
  IndexingProgressStepStatus,
  IndexingReportLevel,
  IndexingReportType,
  type IndexingJobData,
} from "../../bullmq/processors/errors";
import type { PrismaService } from "../../db/prisma.service";
import { IndexingJobStatus } from "./indexing.model";
import { IndexingService } from "./indexing.service";

type CountDelegate = {
  readonly count: ReturnType<typeof vi.fn>;
};

type PrismaMock = {
  readonly $transaction: ReturnType<typeof vi.fn>;
  readonly user: CountDelegate;
  readonly artist: CountDelegate;
  readonly album: CountDelegate;
  readonly track: CountDelegate;
  readonly flacFile: CountDelegate;
  readonly playlist: CountDelegate;
  readonly playlistTrack: CountDelegate;
  readonly userLibraryItem: CountDelegate;
  readonly userItemPlayHistory: CountDelegate;
};

describe("IndexingService", () => {
  let bullmqService: {
    readonly triggerIndexing: ReturnType<typeof vi.fn>;
    readonly getLatestIndexingJob: ReturnType<typeof vi.fn>;
    readonly getJobStatus: ReturnType<typeof vi.fn>;
  };
  let prisma: PrismaMock;
  let pubSub: { readonly publish: ReturnType<typeof vi.fn> };
  let service: IndexingService;

  beforeEach(() => {
    bullmqService = {
      triggerIndexing: vi.fn(),
      getLatestIndexingJob: vi.fn(),
      getJobStatus: vi.fn(),
    };
    prisma = {
      $transaction: vi.fn((values: readonly Promise<number>[]) =>
        Promise.all(values),
      ),
      user: { count: vi.fn().mockResolvedValue(2) },
      artist: { count: vi.fn().mockResolvedValue(3) },
      album: { count: vi.fn().mockResolvedValue(5) },
      track: { count: vi.fn().mockResolvedValueOnce(13).mockResolvedValue(8) },
      flacFile: { count: vi.fn().mockResolvedValue(11) },
      playlist: { count: vi.fn().mockResolvedValue(7) },
      playlistTrack: { count: vi.fn().mockResolvedValue(17) },
      userLibraryItem: { count: vi.fn().mockResolvedValue(19) },
      userItemPlayHistory: { count: vi.fn().mockResolvedValue(23) },
    };
    pubSub = {
      publish: vi.fn(),
    };
    service = new IndexingService(
      bullmqService as unknown as BullmqService,
      prisma as unknown as PrismaService,
      pubSub as never,
    );
  });

  it("returns library stats and the latest indexing job snapshot", async () => {
    const job = {
      id: "job-1",
      data: {
        startedAt: "2026-06-21T10:00:00.000Z",
        updatedAt: "2026-06-21T10:01:00.000Z",
        warnings: [],
        steps: [
          {
            key: IndexingProgressStepKey.EXTRACT_METADATA,
            label: "Extract metadata",
            status: IndexingProgressStepStatus.RUNNING,
            current: 31,
            total: 400,
          },
        ],
        reports: [
          {
            id: "report-1",
            level: IndexingReportLevel.INFO,
            type: IndexingReportType.INFO_STAGE_STARTED,
            message: "Extract metadata started.",
            emittedAt: "2026-06-21T10:00:30.000Z",
          },
        ],
      },
      progress: 25,
      getState: vi.fn().mockResolvedValue("active"),
    } as unknown as Job<IndexingJobData>;
    bullmqService.getLatestIndexingJob.mockResolvedValue(job);

    const overview = await service.getOverview();

    expect(overview.latestJob?.jobId).toBe("job-1");
    expect(overview.latestJob?.status).toBe(IndexingJobStatus.ACTIVE);
    expect(overview.latestJob?.steps).toHaveLength(1);
    expect(overview.latestJob?.reports).toHaveLength(1);
    expect(overview.libraryStats.tracksCount).toBe(13);
    expect(overview.libraryStats.tracksWithLyricsCount).toBe(8);
    expect(overview.libraryStats.playHistoryItemsCount).toBe(23);
  });
});
