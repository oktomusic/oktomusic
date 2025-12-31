import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { type ConfigType } from "@nestjs/config";
import { Job } from "bullmq";
import { PubSub } from "graphql-subscriptions";

import type { MetaflacTags } from "@oktomusic/metaflac-parser";

import { INDEXING_JOB_UPDATED } from "../../api/indexing/indexing.constants";
import { IndexingJobStatus } from "../../api/indexing/indexing.model";
import { PUB_SUB } from "../../common/pubsub/pubsub.module";
import appConfig from "../../config/definitions/app.config";
import { PrismaService } from "../../db/prisma.service";
import type { Album, Artist, Track } from "../../generated/prisma/client";
import { MetaflacError } from "../../native/metaflac-error";
import { MetaflacService } from "../../native/metaflac.service";
import { FFmpegService, FFProbeOutput } from "../../native/ffmpeg.service";
import {
  type IndexingJobData,
  IndexingReportType,
  type IndexingWarning,
} from "./errors";
import { pickAndConvertAlbumCover } from "../../common/utils/sharp-utils";

interface FlacFolder {
  path: string;
  files: string[];
}

export interface IndexingFileData {
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
  trackLinks?: IndexingTrackLink[];
}

type IndexingFileMap = Record<string, IndexingFileData>;
type IndexingFolderMap = Record<string, IndexingFolderData>;

interface IndexingProcessorContext {
  readonly job: Job<IndexingJobData>;
  readonly warnings: IndexingWarning[];
  readonly libraryPath: string;
  readonly sourceData: IndexingFolderMap;
}

export interface IndexingTrackMetadata {
  readonly album: string;
  readonly albumArtists: readonly string[];
  readonly artists: readonly string[];
  readonly title: string;
  readonly discNumber: number;
  readonly trackNumber: number;
  readonly totalTracks?: number;
  readonly totalDiscs?: number;
  readonly isrc?: string;
}

export interface IndexingTrackSource {
  readonly absolutePath: string;
  readonly relativePath: string;
  readonly sampleRate: number;
  readonly bitsPerRawSample: number;
  readonly durationMs: number;
  readonly fileSize: number;
  readonly bitRate: number;
  readonly hash?: string;
}

export interface IndexingTrackLink {
  readonly track: IndexingTrackMetadata;
  readonly source: IndexingTrackSource;
}

const sortByDiscAndTrack = (
  a: IndexingTrackLink,
  b: IndexingTrackLink,
): number => {
  if (a.track.discNumber === b.track.discNumber) {
    return a.track.trackNumber - b.track.trackNumber;
  }
  return a.track.discNumber - b.track.discNumber;
};

const assertRequiredTrackTags = (tags: MetaflacTags, filePath: string): void => {
  if (!tags.ALBUM || !tags.TITLE) {
    throw new Error(
      `Missing mandatory track tags (ALBUM or TITLE) for ${filePath}`,
    );
  }

  if (!Array.isArray(tags.ALBUMARTIST) || tags.ALBUMARTIST.length === 0) {
    throw new Error(`Missing album artist for ${filePath}`);
  }

  if (!Array.isArray(tags.ARTIST) || tags.ARTIST.length === 0) {
    throw new Error(`Missing track artist for ${filePath}`);
  }

  if (!Number.isFinite(tags.DISCNUMBER) || !Number.isFinite(tags.TRACKNUMBER)) {
    throw new Error(`Missing or invalid disc/track number for ${filePath}`);
  }
};

const toRelativeLibraryPath = (root: string, target: string): string => {
  const normalizedRoot = path.resolve(root);
  const normalizedTarget = path.resolve(target);
  const relative = path.relative(normalizedRoot, normalizedTarget) || ".";
  if (relative.startsWith("..")) {
    throw new Error(`Path ${target} is outside of library root ${root}`);
  }
  return relative;
};

export const buildTrackLinksFromFiles = (
  libraryPath: string,
  fileMap: Record<string, IndexingFileData>,
): IndexingTrackLink[] => {
  const trackLinks: IndexingTrackLink[] = Object.entries(fileMap).map(
    ([absolutePath, data]) => {
      assertRequiredTrackTags(data.tags, absolutePath);

      return {
        track: {
          album: data.tags.ALBUM,
          albumArtists: data.tags.ALBUMARTIST,
          artists: data.tags.ARTIST,
          title: data.tags.TITLE,
          discNumber: data.tags.DISCNUMBER,
          trackNumber: data.tags.TRACKNUMBER,
          totalTracks: data.tags.TOTALTRACKS,
          totalDiscs: data.tags.TOTALDISCS,
          isrc: data.tags.ISRC,
        },
        source: {
          absolutePath,
          relativePath: toRelativeLibraryPath(libraryPath, absolutePath),
          sampleRate: data.ffprobe.sampleRate,
          bitsPerRawSample: data.ffprobe.bitsPerRawSample,
          durationMs: data.ffprobe.durationMs,
          fileSize: data.ffprobe.fileSize,
          bitRate: data.ffprobe.bitRate,
          hash: data.hash,
        },
      };
    },
  );

  return trackLinks.sort(sortByDiscAndTrack);
};

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

    // 5. Build a stable mapping between files and track metadata
    for (const [folderPath, folderData] of Object.entries(context.sourceData)) {
      context.sourceData[folderPath].trackLinks = buildTrackLinksFromFiles(
        context.libraryPath,
        folderData.files,
      );
    }

    // 6. Persist albums, artists, tracks and file links
    for (const [, folderData] of Object.entries(context.sourceData)) {
      await this.syncFolderToDatabase(folderData);
    }

    console.log(JSON.stringify(context.sourceData, null, 2));
    for (const [, folderData] of Object.entries(context.sourceData)) {
      console.log(JSON.stringify(folderData.albumSummary, null, 2));
    }

    // WIP: covers
    //
    // Typical 1280x1280 cover.jpg file
    for (const [folderPath] of Object.entries(context.sourceData)) {
      console.log(`Converting covers: ${folderPath}`);
      await pickAndConvertAlbumCover(folderPath);
      console.log(`Converted covers`);
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
    return toRelativeLibraryPath(root, target);
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

  private async syncFolderToDatabase(
    folderData: IndexingFolderData,
  ): Promise<void> {
    if (
      !folderData.albumSummary ||
      !folderData.trackLinks ||
      folderData.trackLinks.length === 0
    ) {
      return;
    }

    const albumArtists = await Promise.all(
      folderData.albumSummary.artists.map((artistName) =>
        this.ensureArtist(artistName),
      ),
    );

    const album = await this.ensureAlbum(
      folderData.albumSummary.album,
      albumArtists,
    );

    await this.syncAlbumArtists(album.id, albumArtists);

    const trackMap = await this.syncTracks(album.id, folderData.trackLinks);

    await this.recreateTrackFiles(
      folderData.trackLinks,
      trackMap,
    );
  }

  private async ensureArtist(name: string): Promise<Artist> {
    return this.prisma.artist.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  private async ensureAlbum(
    albumName: string,
    albumArtists: Artist[],
  ): Promise<Album> {
    const candidates = await this.prisma.album.findMany({
      where: {
        name: albumName,
      },
      include: {
        artists: true,
      },
    });

    const albumArtistIds = albumArtists.map((artist) => artist.id);
    const existing = candidates.find((candidate) => {
      const existingIds = candidate.artists.map((aa) => aa.artistId);
      if (existingIds.length !== albumArtistIds.length) return false;
      return albumArtistIds.every((id) => existingIds.includes(id));
    });

    if (existing) {
      return existing;
    }

    return this.prisma.album.create({
      data: {
        name: albumName,
      },
    });
  }

  private async syncAlbumArtists(
    albumId: string,
    artists: Artist[],
  ): Promise<void> {
    const artistIds = artists.map((artist) => artist.id);

    await this.prisma.albumArtist.deleteMany({
      where: {
        albumId,
        artistId: { notIn: artistIds },
      },
    });

    for (const [order, artist] of artists.entries()) {
      await this.prisma.albumArtist.upsert({
        where: {
          albumId_artistId: {
            albumId,
            artistId: artist.id,
          },
        },
        update: {
          order,
        },
        create: {
          albumId,
          artistId: artist.id,
          order,
        },
      });
    }
  }

  private async syncTrackArtists(
    trackId: string,
    artistNames: readonly string[],
  ): Promise<void> {
    const artists = await Promise.all(
      artistNames.map((name) => this.ensureArtist(name)),
    );

    await this.prisma.trackArtist.deleteMany({
      where: { trackId },
    });

    if (artists.length === 0) {
      throw new Error(`No artists resolved for track ${trackId}`);
    }

    await this.prisma.trackArtist.createMany({
      data: artists.map((artist, order) => ({
        trackId,
        artistId: artist.id,
        order,
      })),
    });
  }

  private async syncTracks(
    albumId: string,
    trackLinks: IndexingTrackLink[],
  ): Promise<Map<string, Track>> {
    const trackByRelativePath = new Map<string, Track>();

    for (const link of trackLinks) {
      const track = await this.prisma.track.upsert({
        where: {
          albumId_discNumber_trackNumber: {
            albumId,
            discNumber: link.track.discNumber,
            trackNumber: link.track.trackNumber,
          },
        },
        update: {
          name: link.track.title,
          isrc: link.track.isrc ?? null,
          durationMs: link.source.durationMs,
          discNumber: link.track.discNumber,
          trackNumber: link.track.trackNumber,
        },
        create: {
          name: link.track.title,
          isrc: link.track.isrc ?? null,
          durationMs: link.source.durationMs,
          discNumber: link.track.discNumber,
          trackNumber: link.track.trackNumber,
          album: {
            connect: {
              id: albumId,
            },
          },
        },
      });

      await this.syncTrackArtists(track.id, link.track.artists);
      trackByRelativePath.set(link.source.relativePath, track);
    }

    return trackByRelativePath;
  }

  private async recreateTrackFiles(
    trackLinks: IndexingTrackLink[],
    trackMap: Map<string, Track>,
  ): Promise<void> {
    const relativePaths = trackLinks.map(
      (link) => link.source.relativePath,
    );

    if (relativePaths.length > 0) {
      await this.prisma.trackFile.deleteMany({
        where: {
          path: { in: relativePaths },
        },
      });
    }

    await this.prisma.trackFile.createMany({
      data: trackLinks.map((link) => {
        const track = trackMap.get(link.source.relativePath);
        if (!track) {
          throw new Error(
            `Missing track mapping for ${link.source.relativePath}`,
          );
        }

        return {
          trackId: track.id,
          path: link.source.relativePath,
          sampleRate: link.source.sampleRate,
          bitsPerRawSample: link.source.bitsPerRawSample,
          durationMs: link.source.durationMs,
          fileSize: link.source.fileSize,
          bitRate: link.source.bitRate,
          hash: link.source.hash,
        };
      }),
    });
  }
}
