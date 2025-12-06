import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { type ConfigType } from "@nestjs/config";
import { Job } from "bullmq";
import { PubSub } from "graphql-subscriptions";
import sharp from "sharp";

import type { MetaflacTags } from "@oktomusic/metaflac-parser";

import { INDEXING_JOB_UPDATED } from "../../api/indexing/indexing.constants";
import { IndexingJobStatus } from "../../api/indexing/indexing.model";
import { PUB_SUB } from "../../common/pubsub/pubsub.module";
import appConfig from "../../config/definitions/app.config";
import { PrismaService } from "../../db/prisma.service";
import { MetaflacError } from "../../native/metaflac-error";
import { MetaflacService } from "../../native/metaflac.service";
import { FFmpegService, FFProbeOutput } from "../../native/ffmpeg.service";
import {
  type IndexingJobData,
  IndexingReportType,
  type IndexingWarning,
} from "./errors";

interface FlacFolder {
  path: string;
  files: string[];
}

interface IndexingFileData {
  readonly tags: MetaflacTags;
  readonly ffprobe: FFProbeOutput;
  readonly hash?: string; // TODO: implement file hashing
}

interface IndexingFolderAlbumSummary {
  readonly album: string;
  readonly artists: string[];
  /**
   * Number of tracks per disk in the album
   *
   * Key is disk number (minus 1), value is number of tracks on that disk
   */
  readonly trackCounts: number[];
}

interface IndexingFolderData {
  readonly files: Record<string, IndexingFileData>;
  hasWarnings: boolean;
  albumSummary?: IndexingFolderAlbumSummary;
}

type IndexingFileMap = Record<string, IndexingFileData>;
type IndexingFolderMap = Record<string, IndexingFolderData>;

interface IndexingProcessorContext {
  readonly job: Job<IndexingJobData>;
  readonly warnings: IndexingWarning[];
  readonly libraryPath: string;
  readonly sourceData: IndexingFolderMap;
}

@Processor("library-indexing")
export class IndexingProcessor extends WorkerHost {
  private readonly logger = new Logger(IndexingProcessor.name);

  constructor(
    private prisma: PrismaService,
    @Inject(appConfig.KEY)
    private readonly appConf: ConfigType<typeof appConfig>,
    @Inject(PUB_SUB)
    private readonly pubSub: PubSub,
    private readonly metaflacService: MetaflacService,
    private readonly ffmpegService: FFmpegService,
  ) {
    super();
  }

  async process(job: Job<IndexingJobData>) {
    const libraryPath = this.appConf.libraryPath;
    const warnings = Array.isArray(job.data?.warnings) ? job.data.warnings : [];

    if (!Array.isArray(job.data?.warnings)) {
      await job.updateData({ ...(job.data ?? {}), warnings });
    }

    const context: IndexingProcessorContext = {
      job,
      warnings,
      libraryPath,
      sourceData: {},
    };

    this.logger.log(`Processing job ${job.id}`);

    // 1. Find all folders with FLAC files
    const flacFolders = await this.findFlacFolders(libraryPath, context);
    this.logger.log(`Found ${flacFolders.length} folder(s) with FLAC files`);

    if (flacFolders.length === 0) {
      await job.updateProgress(100);
      await this.publishJobStatus(
        job,
        IndexingJobStatus.COMPLETED,
        100,
        warnings,
      );
      return { ok: true, folders: {}, warnings };
    }

    // 2. Extract metadata from each file in each folder
    for (const [index, folder] of flacFolders.entries()) {
      this.logger.log(
        `Scanning folder ${index + 1} of ${flacFolders.length}: ${folder.path}`,
      );

      for (const filePath of folder.files) {
        try {
          const tags = await this.metaflacService.extractTags(filePath);
          const ffprobe =
            await this.ffmpegService.ffprobeInformations(filePath);

          if (!context.sourceData[folder.path]) {
            context.sourceData[folder.path] = {
              files: {},
              hasWarnings: false,
            };
          }

          context.sourceData[folder.path].files[filePath] = { tags, ffprobe };
        } catch (error) {
          const errorMessage =
            error instanceof MetaflacError ? error.message : "Unknown error";

          await this.addWarning(context, {
            type: IndexingReportType.ERROR_METAFLAC_PARSING,
            filePath: this.toRelativePath(libraryPath, filePath),
            errorMessage,
          });
        }
      }
    }

    // 3. Validate metadata consistency per album folder

    for (const [folderPath, folderData] of Object.entries(context.sourceData)) {
      console.log(`Validating folder: ${folderPath}`);
      const errors = this.validateFlacFolder(folderData.files);
      // TODO: extract the guessed album info and store it somewhere

      if (errors.length !== 0) {
        await this.addWarning(context, {
          type: IndexingReportType.WARNING_FOLDER_METADATA,
          folderPath: this.toRelativePath(context.libraryPath, folderPath),
          messages: [...errors],
        });
        context.sourceData[folderPath].hasWarnings = true;
      }
    }

    // 4. Extract album summary info per folder
    for (const [folderPath, folderData] of Object.entries(context.sourceData)) {
      const fileArray = Object.values(folderData.files);
      if (fileArray.length === 0) continue;

      const album: string = fileArray[0].tags.ALBUM;
      const artists: string[] = fileArray[0].tags.ALBUMARTIST;

      // Extract trackCounts: number of tracks per disk (disk number minus 1)
      // Use DISCNUMBER, TRACKNUMBER, TOTALTRACKS, TOTALDISCS as numbers
      const tracksByDisk: Map<number, number[]> = new Map();
      for (const file of fileArray) {
        const discNum = file.tags.DISCNUMBER;
        const trackNum = file.tags.TRACKNUMBER;
        const diskIdx = discNum - 1; // disk number minus 1
        if (!tracksByDisk.has(diskIdx)) tracksByDisk.set(diskIdx, []);
        tracksByDisk.get(diskIdx)!.push(trackNum);
      }
      // trackCounts: for each disk, use TOTALTRACKS (always set)
      const trackCounts: number[] = [];
      const maxDiskIdx =
        tracksByDisk.size > 0 ? Math.max(...tracksByDisk.keys()) : -1;
      for (let i = 0; i <= maxDiskIdx; i++) {
        const diskFiles = fileArray.filter((f) => f.tags.DISCNUMBER === i + 1);
        // TOTALTRACKS is always set, so we use it directly
        trackCounts[i] =
          diskFiles.length > 0 ? diskFiles[0].tags.TOTALTRACKS : 0;
      }

      context.sourceData[folderPath].albumSummary = {
        album,
        artists,
        trackCounts,
      };
    }

    console.log(JSON.stringify(context.sourceData, null, 2));
    for (const [, folderData] of Object.entries(context.sourceData)) {
      console.log(JSON.stringify(folderData.albumSummary, null, 2));
    }

    // WIP: covers
    //
    // Typical 1280x1280 cover.jpg file
    for (const [folderPath] of Object.entries(context.sourceData)) {
      const coverPath = path.resolve(folderPath, "cover.jpg");

      const resolutions = [64, 128, 256, 512, 1024];

      const quality = 60; // 0–100 but usually 30–60 is best
      const effort = 9; // 0–9 encoding effort (higher = slower)
      const chromaSubsampling = "4:4:4"; // best quality

      try {
        await fs.access(coverPath, fs.constants.R_OK);
        console.log(`Folder ${folderPath} has a cover.jpg file`);

        const image = sharp(coverPath);

        for (const res of resolutions) {
          const outputPath = path.resolve(folderPath, `cover_${res}x.avif`);
          await image
            .clone()
            .resize({ height: res, width: res, fit: sharp.fit.cover })
            .avif({
              quality: quality,
              effort: effort,
              chromaSubsampling: chromaSubsampling,
            })
            .toFile(outputPath);
          console.log(`  - generated ${outputPath}`);
        }

        await image
          .clone()
          .avif({
            quality: quality,
            effort: effort,
            chromaSubsampling: chromaSubsampling,
          })
          .toFile(path.resolve(folderPath, `cover_1280x.avif`));
        console.log(`  - generated cover_1280x.avif`);
      } catch {
        console.log(`Folder ${folderPath} does not have a cover.jpg file`);
      }
    }

    console.log("Indexing completed");
    await job.updateProgress(100);
    await this.publishJobStatus(
      job,
      IndexingJobStatus.COMPLETED,
      100,
      context.warnings,
    );
    return {
      ok: true,
      folders: context.sourceData,
      warnings: context.warnings,
    };
  }

  private async findFlacFolders(
    directory: string,
    context: IndexingProcessorContext,
  ): Promise<FlacFolder[]> {
    let entries: Dirent[];
    try {
      entries = await fs.readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Unable to read directory ${directory}: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Unable to read directory ${directory}: ${String(error)}`,
        );
      }
      return [];
    }

    const flacFiles = entries
      .filter(
        (entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".flac"),
      )
      .map((entry) => path.join(directory, entry.name));

    if (flacFiles.length > 0) {
      const nestedDirs = entries.filter((entry) => entry.isDirectory());
      if (nestedDirs.length > 0) {
        this.logger.warn(
          `Directory ${directory} contains FLAC files and ${nestedDirs.length} subdirector${nestedDirs.length === 1 ? "y" : "ies"}. Nested folders will not be scanned.`,
        );
        await this.addWarning(context, {
          type: IndexingReportType.WARNING_SUBDIRECTORIES,
          dirPath: this.toRelativePath(context.libraryPath, directory),
        });
      }
      return [
        {
          path: directory,
          files: flacFiles,
        },
      ];
    }

    const result: FlacFolder[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.isSymbolicLink()) {
        continue;
      }
      const nested = await this.findFlacFolders(
        path.join(directory, entry.name),
        context,
      );
      result.push(...nested);
    }

    return result;
  }

  /**
   * Evaluate a folder of FLAC files for metadata consistency.
   *
   * If a folder passes all checks it is considered a candidate for an album
   * (no duplication check yet, the folder is evaluated alone).
   *
   * @returns Array of error messages for found inconsistencies
   */
  private validateFlacFolder(fileMap: IndexingFileMap): string[] {
    const fileArray = Object.values(fileMap);
    const metadataIssues: string[] = [];

    // 1. ALBUM consistency
    const albumSet = new Set(fileArray.map((f) => f.tags.ALBUM));
    if (albumSet.size > 1) {
      metadataIssues.push(
        `Inconsistent ALBUM values: ${Array.from(albumSet).join(", ")}`,
      );
    }

    // 2. ALBUMARTIST consistency
    const albumArtistSet = new Set(
      fileArray.map((f) => JSON.stringify(f.tags.ALBUMARTIST)),
    );
    if (albumArtistSet.size > 1) {
      metadataIssues.push(
        `Inconsistent ALBUMARTIST values: ${Array.from(albumArtistSet).join(", ")}`,
      );
    }

    // 3. DISCNUMBER totals consistency
    const discTotals = new Map<number, number>();

    for (const f of Object.values(fileMap)) {
      const disc = f.tags.DISCNUMBER;
      const discTotal = f.tags.TOTALDISCS;
      discTotals.set(disc, discTotal);
    }
    const uniqueTotals = new Set(discTotals.values());
    if (uniqueTotals.size > 1) {
      metadataIssues.push(
        `Inconsistent DISCNUMBER totals: ${Array.from(uniqueTotals).join(", ")}`,
      );
    }

    return metadataIssues;
  }

  private async addWarning(
    context: IndexingProcessorContext,
    warning: IndexingWarning,
  ) {
    context.warnings.push(warning);
    await context.job.updateData({
      ...(context.job.data ?? { warnings: [] }),
      warnings: context.warnings,
    });
    await this.publishJobStatus(
      context.job,
      IndexingJobStatus.ACTIVE,
      this.getJobProgress(context.job),
      context.warnings,
    );
  }

  private getJobProgress(job: Job<IndexingJobData>): number {
    return typeof job.progress === "number" ? Number(job.progress) : 0;
  }

  private toRelativePath(root: string, target: string): string {
    const relative = path.relative(root, target) || ".";
    return relative.startsWith("..") ? target : relative;
  }

  private async publishJobStatus(
    job: Job<IndexingJobData>,
    status: IndexingJobStatus,
    progress: number,
    warnings: IndexingWarning[],
  ) {
    await this.pubSub.publish(INDEXING_JOB_UPDATED, {
      indexingJobUpdated: {
        jobId: job.id,
        status,
        progress,
        error: job.failedReason,
        warnings,
        completedAt:
          status === IndexingJobStatus.COMPLETED
            ? new Date().toISOString()
            : undefined,
      },
    });
  }
}
