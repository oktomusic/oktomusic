import fs from "node:fs";
import path from "node:path";

import { Inject } from "@nestjs/common";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { type ConfigType } from "@nestjs/config";

import { Job } from "bullmq";

import appConfig from "../../config/definitions/app.config";

export interface LibraryScanJob {
  startPath?: string;
}

export interface LibraryScanResult {
  files: string[];
  totalFiles: number;
}

@Processor("library-scan")
export class LibraryScanProcessor extends WorkerHost {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConf: ConfigType<typeof appConfig>,
  ) {
    super();
  }

  async process(job: Job<LibraryScanJob>): Promise<LibraryScanResult> {
    const startPath = job.data.startPath ?? this.appConf.libraryPath;

    await job.log(`Starting library scan from: ${startPath}`);

    const files = this.scanDirectory(startPath);

    await job.log(`Library scan completed. Found ${files.length} files.`);

    return {
      files,
      totalFiles: files.length,
    };
  }

  private scanDirectory(dirPath: string): string[] {
    const files: string[] = [];

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isFile()) {
          files.push(fullPath);
        } else if (entry.isDirectory()) {
          // Recursively scan subdirectories
          const subFiles = this.scanDirectory(fullPath);
          files.push(...subFiles);
        }
      }
    } catch (error) {
      // Log error but continue scanning
      console.error(`Error scanning directory ${dirPath}:`, error);
    }

    return files;
  }
}
