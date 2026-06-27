import type { Job, Queue } from "bullmq";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { IndexingJobData } from "./processors/errors";
import { BullmqService } from "./bullmq.service";

type QueueMock = {
  readonly add: ReturnType<typeof vi.fn>;
  readonly getJob: ReturnType<typeof vi.fn>;
  readonly getJobs: ReturnType<typeof vi.fn>;
};

function createJob(
  id: string,
  timestamp: number,
  overrides: Partial<Job<IndexingJobData>> = {},
): Job<IndexingJobData> {
  return {
    id,
    timestamp,
    ...overrides,
  } as Job<IndexingJobData>;
}

describe("BullmqService", () => {
  let queue: QueueMock;
  let service: BullmqService;

  beforeEach(() => {
    queue = {
      add: vi.fn(),
      getJob: vi.fn(),
      getJobs: vi.fn(),
    };
    service = new BullmqService(queue as unknown as Queue<IndexingJobData>);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the current indexing job instead of queueing another one", async () => {
    const currentJob = createJob("job-active", 200);
    queue.getJobs.mockResolvedValue([currentJob]);

    await expect(service.triggerIndexing()).resolves.toBe(currentJob);

    expect(queue.add).not.toHaveBeenCalled();
    expect(queue.getJobs).toHaveBeenCalledWith(
      ["active", "waiting", "delayed", "prioritized", "waiting-children"],
      0,
      -1,
      false,
    );
  });

  it("queues a new indexing job when there is no current job", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-21T10:00:00.000Z"));

    const newJob = createJob("job-new", 300);
    queue.getJobs.mockResolvedValue([]);
    queue.add.mockResolvedValue(newJob);

    await expect(service.triggerIndexing()).resolves.toBe(newJob);

    expect(queue.add).toHaveBeenCalledWith("index", {
      warnings: [],
      reports: [],
      steps: [],
      startedAt: "2026-06-21T10:00:00.000Z",
      updatedAt: "2026-06-21T10:00:00.000Z",
    });
  });

  it("prefers a current job over completed or failed jobs", async () => {
    const currentJob = createJob("job-waiting", 100);
    queue.getJobs.mockResolvedValueOnce([currentJob]);

    await expect(service.getLatestIndexingJob()).resolves.toBe(currentJob);

    expect(queue.getJobs).toHaveBeenCalledTimes(1);
  });

  it("returns the newest terminal job when no job is current", async () => {
    const oldJob = createJob("job-old", 100, { finishedOn: 110 });
    const newJob = createJob("job-new", 200, { finishedOn: 220 });

    queue.getJobs
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([oldJob, newJob]);

    await expect(service.getLatestIndexingJob()).resolves.toBe(newJob);
  });
});
