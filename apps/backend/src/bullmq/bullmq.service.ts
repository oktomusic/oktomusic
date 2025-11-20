import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";

import { Queue } from "bullmq";

import type {
  LibraryScanJob,
  LibraryScanResult,
} from "./processors/library-scan.processor";

@Injectable()
export class BullmqService {
  constructor(
    @InjectQueue("library-scan")
    private readonly libraryScanQueue: Queue<LibraryScanJob, LibraryScanResult>,
  ) {}

  /**
   * Trigger a library scan job
   * @param startPath Optional path to start scanning from (defaults to configured library path)
   * @returns Job ID
   */
  async triggerLibraryScan(startPath?: string): Promise<string> {
    const job = await this.libraryScanQueue.add("scan", {
      startPath,
    });

    return job.id ?? "";
  }

  /**
   * Get the library scan queue for additional operations
   */
  getLibraryScanQueue(): Queue<LibraryScanJob, LibraryScanResult> {
    return this.libraryScanQueue;
  }
}

