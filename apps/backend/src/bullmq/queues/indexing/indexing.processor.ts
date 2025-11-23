import fs from "node:fs/promises";
import path from "node:path";

import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Job } from "bullmq";

import type { AppConfig } from "../../../config/definitions/app.config";

export interface IndexingJobData {
  type: "full" | "partial";
}

@Processor("indexing")
export class IndexingProcessor extends WorkerHost {
  private readonly logger = new Logger(IndexingProcessor.name);

  constructor(private configService: ConfigService) {
    super();
  }

  async process(job: Job<IndexingJobData>): Promise<void> {
    this.logger.log(`Processing indexing job ${job.id} with type: ${job.data.type}`);

    const { libraryPath } = this.configService.getOrThrow<AppConfig>("app");

    try {
      const files = await this.listFiles(libraryPath);
      this.logger.log(`Found ${files.length} files in library path: ${libraryPath}`);
      
      // Log first 10 files as a sample
      const sampleFiles = files.slice(0, 10);
      this.logger.log(`Sample files: ${JSON.stringify(sampleFiles, null, 2)}`);
      
      if (files.length > 10) {
        this.logger.log(`... and ${files.length - 10} more files`);
      }
    } catch (error) {
      this.logger.error(`Error listing files: ${error}`);
      throw error;
    }
  }

  private async listFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];

    async function readDir(currentPath: string) {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          await readDir(fullPath);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    }

    await readDir(dirPath);
    return files;
  }
}
