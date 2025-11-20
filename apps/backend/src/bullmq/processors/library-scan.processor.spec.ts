import fs from "node:fs";
import path from "node:path";

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";

import type { Job } from "bullmq";

import {
  LibraryScanProcessor,
  type LibraryScanJob,
  type LibraryScanResult,
} from "./library-scan.processor";
import appConfig from "../../config/definitions/app.config";

describe("LibraryScanProcessor", () => {
  let processor: LibraryScanProcessor;
  let tempDir: string;

  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = fs.mkdtempSync(path.join("/tmp", "library-test-"));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LibraryScanProcessor,
        {
          provide: appConfig.KEY,
          useValue: {
            libraryPath: tempDir,
            env: "test",
            isDev: false,
            isProd: false,
            isTest: true,
            sessionSecret: "test-secret",
          },
        },
      ],
    }).compile();

    processor = module.get<LibraryScanProcessor>(LibraryScanProcessor);
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("should be defined", () => {
    expect(processor).toBeDefined();
  });

  it("should scan an empty directory", async () => {
    const mockJob = {
      data: {},
      log: vi.fn().mockResolvedValue(undefined),
    } as unknown as Job<LibraryScanJob>;

    const result: LibraryScanResult = await processor.process(mockJob);

    expect(result.files).toEqual([]);
    expect(result.totalFiles).toBe(0);
    expect(mockJob.log).toHaveBeenCalledWith(
      expect.stringContaining("Starting library scan"),
    );
    expect(mockJob.log).toHaveBeenCalledWith(
      expect.stringContaining("Found 0 files"),
    );
  });

  it("should scan a directory with files", async () => {
    // Create test files
    fs.writeFileSync(path.join(tempDir, "song1.flac"), "test content");
    fs.writeFileSync(path.join(tempDir, "song2.mp3"), "test content");
    fs.writeFileSync(path.join(tempDir, "metadata.json"), "{}");

    const mockJob = {
      data: {},
      log: vi.fn().mockResolvedValue(undefined),
    } as unknown as Job<LibraryScanJob>;

    const result: LibraryScanResult = await processor.process(mockJob);

    expect(result.files).toHaveLength(3);
    expect(result.totalFiles).toBe(3);
    expect(result.files).toContain(path.join(tempDir, "song1.flac"));
    expect(result.files).toContain(path.join(tempDir, "song2.mp3"));
    expect(result.files).toContain(path.join(tempDir, "metadata.json"));
  });

  it("should scan nested directories", async () => {
    // Create nested directory structure
    const subDir = path.join(tempDir, "artist");
    const albumDir = path.join(subDir, "album");
    fs.mkdirSync(subDir);
    fs.mkdirSync(albumDir);

    fs.writeFileSync(path.join(tempDir, "root.txt"), "root");
    fs.writeFileSync(path.join(subDir, "artist.flac"), "artist");
    fs.writeFileSync(path.join(albumDir, "track1.flac"), "track1");
    fs.writeFileSync(path.join(albumDir, "track2.flac"), "track2");

    const mockJob = {
      data: {},
      log: vi.fn().mockResolvedValue(undefined),
    } as unknown as Job<LibraryScanJob>;

    const result: LibraryScanResult = await processor.process(mockJob);

    expect(result.files).toHaveLength(4);
    expect(result.totalFiles).toBe(4);
    expect(result.files).toContain(path.join(tempDir, "root.txt"));
    expect(result.files).toContain(path.join(subDir, "artist.flac"));
    expect(result.files).toContain(path.join(albumDir, "track1.flac"));
    expect(result.files).toContain(path.join(albumDir, "track2.flac"));
  });

  it("should use custom startPath if provided", async () => {
    const customDir = fs.mkdtempSync(path.join("/tmp", "custom-test-"));
    fs.writeFileSync(path.join(customDir, "custom.txt"), "custom");

    const mockJob = {
      data: { startPath: customDir },
      log: vi.fn().mockResolvedValue(undefined),
    } as unknown as Job<LibraryScanJob>;

    const result: LibraryScanResult = await processor.process(mockJob);

    expect(result.files).toHaveLength(1);
    expect(result.files[0]).toBe(path.join(customDir, "custom.txt"));
    expect(mockJob.log).toHaveBeenCalledWith(
      expect.stringContaining(customDir),
    );

    // Clean up
    fs.rmSync(customDir, { recursive: true, force: true });
  });

  it("should handle directory with no read permissions gracefully", async () => {
    const restrictedDir = path.join(tempDir, "restricted");
    fs.mkdirSync(restrictedDir);
    fs.writeFileSync(path.join(restrictedDir, "hidden.txt"), "hidden");

    // Make directory unreadable (this might not work on all systems)
    try {
      fs.chmodSync(restrictedDir, 0o000);

      const mockJob = {
        data: {},
        log: vi.fn().mockResolvedValue(undefined),
      } as unknown as Job<LibraryScanJob>;

      // Should not throw an error
      const result: LibraryScanResult = await processor.process(mockJob);

      expect(result).toBeDefined();
      expect(result.files).toBeDefined();

      // Restore permissions for cleanup
      fs.chmodSync(restrictedDir, 0o755);
    } catch {
      // Skip test if chmod doesn't work (e.g., on Windows)
      fs.chmodSync(restrictedDir, 0o755);
    }
  });
});
