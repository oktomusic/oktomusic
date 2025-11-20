import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { getQueueToken } from "@nestjs/bullmq";

import type { Queue } from "bullmq";

import { BullmqService } from "./bullmq.service";
import type {
  LibraryScanJob,
  LibraryScanResult,
} from "./processors/library-scan.processor";

describe("BullmqService", () => {
  let service: BullmqService;
  let mockQueue: Partial<Queue<LibraryScanJob, LibraryScanResult>>;

  beforeEach(async () => {
    mockQueue = {
      add: vi.fn().mockResolvedValue({ id: "test-job-id" }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BullmqService,
        {
          provide: getQueueToken("library-scan"),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<BullmqService>(BullmqService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should trigger a library scan without a custom path", async () => {
    const jobId = await service.triggerLibraryScan();

    expect(mockQueue.add).toHaveBeenCalledWith("scan", {
      startPath: undefined,
    });
    expect(jobId).toBe("test-job-id");
  });

  it("should trigger a library scan with a custom path", async () => {
    const customPath = "/custom/path";
    const jobId = await service.triggerLibraryScan(customPath);

    expect(mockQueue.add).toHaveBeenCalledWith("scan", {
      startPath: customPath,
    });
    expect(jobId).toBe("test-job-id");
  });

  it("should return empty string if job ID is undefined", async () => {
    mockQueue.add = vi.fn().mockResolvedValue({ id: undefined });

    const jobId = await service.triggerLibraryScan();

    expect(jobId).toBe("");
  });

  it("should return the library scan queue", () => {
    const queue = service.getLibraryScanQueue();

    expect(queue).toBe(mockQueue);
  });
});
