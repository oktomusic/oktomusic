import type { Dirent } from "node:fs";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { type ConfigType } from "@nestjs/config";
import { Job } from "bullmq";
import { Prisma } from "../../generated/prisma/client";
import { PubSub } from "graphql-subscriptions";
import sharp from "sharp";
import { Temporal } from "temporal-polyfill";

import type { Lyrics } from "@oktomusic/lyrics";
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
  type IndexingProgressStep,
  IndexingProgressStepKey,
  IndexingProgressStepStatus,
  type IndexingReportItem,
  IndexingReportLevel,
  IndexingReportType,
  type IndexingWarning,
} from "./errors";
import {
  getAlbumSignature,
  getOrderedTrackKeys,
  getTrackCountsPerDisc,
  pickAlbumDateFromTrackDates,
} from "./indexing.utils";
import {
  getAlbumDiscTrackKey,
  getPreferredTrackIdentity,
  getTrackUpdatePlan,
  normalizeIsrc,
  normalizeTitle,
} from "./indexing.tracks.utils";
import { findAndParseLyrics } from "./indexing.lyrics.utils";
import {
  type AlbumCoverColors,
  convertAlbumCoverCandidate,
  extractAlbumCoverColors,
  pickAlbumCoverCandidate,
} from "../../common/utils/sharp-utils";
import { dateToPlainDate, plainDateToDate } from "../../utils/date";

interface FlacFolder {
  path: string;
  files: string[];
}

interface IndexingFileData {
  readonly tags: MetaflacTags;
  readonly ffprobe: FFProbeOutput;
  readonly hash?: string; // TODO: implement file hashing
  readonly lyrics: Lyrics | null;
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
  albumId?: string;
  coverCandidatePath?: string;
  coverHash?: string;
  coverColors?: AlbumCoverColors;
}

type IndexingFileMap = Record<string, IndexingFileData>;
type IndexingFolderMap = Record<string, IndexingFolderData>;

interface IndexingProcessorContext {
  readonly job: Job<IndexingJobData>;
  readonly warnings: IndexingWarning[];
  readonly reports: IndexingReportItem[];
  readonly steps: IndexingProgressStep[];
  readonly startedAt: string;
  readonly libraryPath: string;
  readonly sourceData: IndexingFolderMap;
}

@Processor("library-indexing", { concurrency: 1 })
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
    const reports = Array.isArray(job.data?.reports) ? job.data.reports : [];
    const steps =
      Array.isArray(job.data?.steps) && job.data.steps.length > 0
        ? job.data.steps
        : this.createInitialSteps();
    const startedAt = job.data?.startedAt ?? new Date().toISOString();

    const context: IndexingProcessorContext = {
      job,
      warnings,
      reports,
      steps,
      startedAt,
      libraryPath,
      sourceData: {},
    };

    await this.persistJobData(context);

    this.logger.log(`Processing job ${job.id}`);

    try {
      // 1. Find all folders with FLAC files
      await this.startStep(
        context,
        IndexingProgressStepKey.DISCOVER_FLAC_FOLDERS,
      );
      const flacFolders = await this.findFlacFolders(libraryPath, context);
      const totalFlacFiles = flacFolders.reduce(
        (total, folder) => total + folder.files.length,
        0,
      );
      await this.completeStep(
        context,
        IndexingProgressStepKey.DISCOVER_FLAC_FOLDERS,
        {
          current: flacFolders.length,
          total: flacFolders.length,
          detail: `Found ${flacFolders.length} folder(s) and ${totalFlacFiles} FLAC file(s).`,
        },
      );
      this.logger.log(`Found ${flacFolders.length} folder(s) with FLAC files`);

      if (flacFolders.length === 0) {
        await this.skipRemainingSteps(context);
        await job.updateProgress(100);
        await this.publishJobStatus(
          job,
          IndexingJobStatus.COMPLETED,
          100,
          context,
        );
        return { ok: true, folders: {}, warnings };
      }

      // 2. Extract metadata from each file in each folder
      await this.startStep(context, IndexingProgressStepKey.EXTRACT_METADATA, {
        current: 0,
        total: totalFlacFiles,
        detail: "Reading FLAC tags, ffprobe data, and lyrics.",
      });
      let processedMetadataFiles = 0;
      for (const [index, folder] of flacFolders.entries()) {
        this.logger.log(
          `Scanning folder ${index + 1} of ${flacFolders.length}: ${folder.path}`,
        );

        for (const filePath of folder.files) {
          try {
            const tags = await this.metaflacService.extractTags(filePath);
            const ffprobe =
              await this.ffmpegService.ffprobeInformations(filePath);
            const lyricsResult = await findAndParseLyrics(filePath);

            // Report lyrics parsing errors
            if (lyricsResult.error) {
              await this.addWarning(context, {
                type: IndexingReportType.ERROR_LYRICS_PARSING,
                filePath: this.toRelativePath(
                  libraryPath,
                  lyricsResult.error.filePath,
                ),
                errorMessage: lyricsResult.error.message,
              });
            }

            if (!context.sourceData[folder.path]) {
              context.sourceData[folder.path] = {
                files: {},
                hasWarnings: false,
              };
            }

            context.sourceData[folder.path].files[filePath] = {
              tags,
              ffprobe,
              lyrics: lyricsResult.lyrics,
            };
          } catch (error) {
            const errorMessage =
              error instanceof MetaflacError ? error.message : "Unknown error";

            await this.addWarning(context, {
              type: IndexingReportType.ERROR_METAFLAC_PARSING,
              filePath: this.toRelativePath(libraryPath, filePath),
              errorMessage,
            });
          } finally {
            processedMetadataFiles += 1;
            await this.updateStep(
              context,
              IndexingProgressStepKey.EXTRACT_METADATA,
              {
                current: processedMetadataFiles,
                total: totalFlacFiles,
                detail: this.toRelativePath(libraryPath, filePath),
              },
            );
          }
        }
      }
      await this.completeStep(
        context,
        IndexingProgressStepKey.EXTRACT_METADATA,
        {
          current: processedMetadataFiles,
          total: totalFlacFiles,
          detail: `Extracted metadata from ${processedMetadataFiles} / ${totalFlacFiles} file(s).`,
        },
      );

      // 3. Validate metadata consistency per album folder

      const foldersWithMetadata = Object.entries(context.sourceData);
      await this.startStep(context, IndexingProgressStepKey.VALIDATE_METADATA, {
        current: 0,
        total: foldersWithMetadata.length,
        detail: "Checking album folder consistency.",
      });
      let validatedFolders = 0;
      for (const [folderPath, folderData] of foldersWithMetadata) {
        const errors = this.validateFlacFolder(folderData.files);

        if (errors.length !== 0) {
          await this.addWarning(context, {
            type: IndexingReportType.WARNING_FOLDER_METADATA,
            folderPath: this.toRelativePath(context.libraryPath, folderPath),
            messages: [...errors],
          });
          context.sourceData[folderPath].hasWarnings = true;
        }
        validatedFolders += 1;
        await this.updateStep(
          context,
          IndexingProgressStepKey.VALIDATE_METADATA,
          {
            current: validatedFolders,
            total: foldersWithMetadata.length,
            detail: this.toRelativePath(context.libraryPath, folderPath),
          },
        );
      }
      await this.completeStep(
        context,
        IndexingProgressStepKey.VALIDATE_METADATA,
        {
          current: validatedFolders,
          total: foldersWithMetadata.length,
          detail: `Validated ${validatedFolders} album folder(s).`,
        },
      );

      // 4. Extract album summary info per folder
      for (const [folderPath, folderData] of Object.entries(
        context.sourceData,
      )) {
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
          const diskFiles = fileArray.filter(
            (f) => f.tags.DISCNUMBER === i + 1,
          );
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

      // 4.5 Extract and validate album covers (required for creating new albums)
      const coverCandidateFolders = Object.entries(context.sourceData).filter(
        ([, folderData]) => folderData.albumSummary !== undefined,
      );
      await this.startStep(context, IndexingProgressStepKey.ANALYZE_COVERS, {
        current: 0,
        total: coverCandidateFolders.length,
        detail: "Checking album covers and extracting colors.",
      });
      let analyzedCoverFolders = 0;
      for (const [folderPath, folderData] of coverCandidateFolders) {
        try {
          if (folderData.albumSummary === undefined) continue;

          const candidatePath = await pickAlbumCoverCandidate(folderPath);
          if (!candidatePath) {
            await this.addWarning(context, {
              type: IndexingReportType.WARNING_FOLDER_METADATA,
              folderPath: this.toRelativePath(context.libraryPath, folderPath),
              messages: [
                "Missing album cover (expected cover.png/cover.avif/cover.jpg/cover.jpeg). Album will not be created.",
              ],
            });
            continue;
          }

          // Validate the cover image by loading it with sharp
          let srcImage: sharp.Sharp;
          try {
            srcImage = sharp(candidatePath);
            await srcImage.metadata();
          } catch (error) {
            await this.addWarning(context, {
              type: IndexingReportType.WARNING_FOLDER_METADATA,
              folderPath: this.toRelativePath(context.libraryPath, folderPath),
              messages: [
                `Invalid album cover file: ${this.toRelativePath(context.libraryPath, candidatePath)}`,
                error instanceof Error ? error.message : "Unknown error",
                "Album will not be created.",
              ],
            });
            continue;
          }

          // Compute cover hash
          const coverBytes = await fs.readFile(candidatePath);
          const coverHash = crypto
            .createHash("sha256")
            .update(coverBytes)
            .digest("hex");

          // Extract vibrant colors from the cover image
          let coverColors: AlbumCoverColors;
          try {
            coverColors = await extractAlbumCoverColors(srcImage);
          } catch (error) {
            await this.addWarning(context, {
              type: IndexingReportType.WARNING_FOLDER_METADATA,
              folderPath: this.toRelativePath(context.libraryPath, folderPath),
              messages: [
                `Failed to extract vibrant colors from album cover: ${this.toRelativePath(context.libraryPath, candidatePath)}`,
                error instanceof Error ? error.message : "Unknown error",
                "Album will not be created.",
              ],
            });
            continue;
          }

          context.sourceData[folderPath].coverCandidatePath = candidatePath;
          context.sourceData[folderPath].coverHash = coverHash;
          context.sourceData[folderPath].coverColors = coverColors;
        } finally {
          analyzedCoverFolders += 1;
          await this.updateStep(
            context,
            IndexingProgressStepKey.ANALYZE_COVERS,
            {
              current: analyzedCoverFolders,
              total: coverCandidateFolders.length,
              detail: this.toRelativePath(context.libraryPath, folderPath),
            },
          );
        }
      }
      await this.completeStep(context, IndexingProgressStepKey.ANALYZE_COVERS, {
        current: analyzedCoverFolders,
        total: coverCandidateFolders.length,
        detail: `Analyzed covers for ${analyzedCoverFolders} album folder(s).`,
      });

      const albumSummaryCount = Object.values(context.sourceData).filter(
        (folderData) => folderData.albumSummary !== undefined,
      ).length;
      this.logger.log(`Prepared ${albumSummaryCount} album summary record(s)`);

      // 5. Match and create artists
      const artistNames = new Set<string>();
      for (const [folderPath] of Object.entries(context.sourceData).filter(
        ([, data]) => !data.hasWarnings && data.albumSummary !== undefined,
      )) {
        // Get artist names from files
        const fileArtists = Object.values(
          context.sourceData[folderPath].files,
        ).flatMap(({ tags }) => {
          return tags.ARTIST;
        });

        // Merge with album artists
        const mergedArtists = [
          ...context.sourceData[folderPath].albumSummary!.artists,
          ...fileArtists,
        ];

        for (const artistName of mergedArtists) {
          artistNames.add(artistName);
        }
      }
      this.logger.log(`Found ${artistNames.size} unique artist names`);

      // Insert artists into DB if not existing already
      const normalizedUniqueNames = [...artistNames];
      await this.startStep(context, IndexingProgressStepKey.SYNC_ARTISTS, {
        current: 0,
        total: normalizedUniqueNames.length,
        detail: "Creating missing artist records.",
      });
      if (normalizedUniqueNames.length > 0) {
        const { count } = await this.prisma.artist.createMany({
          data: normalizedUniqueNames.map((name) => ({ name })),
          skipDuplicates: true,
        });

        this.logger.log(
          `Artists: created ${count} new (out of ${normalizedUniqueNames.length} unique names)`,
        );
      }
      await this.completeStep(context, IndexingProgressStepKey.SYNC_ARTISTS, {
        current: normalizedUniqueNames.length,
        total: normalizedUniqueNames.length,
        detail: `Synchronized ${normalizedUniqueNames.length} artist name(s).`,
      });

      // 6. Match and create albums

      const albumCandidates = Object.entries(context.sourceData).filter(
        ([, data]) => !data.hasWarnings && data.albumSummary !== undefined,
      );
      await this.startStep(context, IndexingProgressStepKey.SYNC_ALBUMS, {
        current: 0,
        total: albumCandidates.length,
        detail: "Matching albums and generating cover assets.",
      });

      if (albumCandidates.length > 0) {
        const candidateAlbumNames = [
          ...new Set(
            albumCandidates
              .map(([, data]) => data.albumSummary!.album)
              .map((name) => name.trim())
              .filter((name) => name.length > 0),
          ),
        ];

        const existingAlbums: Array<{
          readonly id: string;
          readonly name: string;
          readonly date: Date | null;
          readonly coverHash: string;
          readonly artists: ReadonlyArray<{
            readonly artist: { readonly name: string };
          }>;
          readonly tracks: ReadonlyArray<{
            readonly discNumber: number;
            readonly trackNumber: number;
            readonly isrc: string | null;
            readonly name: string;
          }>;
        }> =
          candidateAlbumNames.length > 0
            ? await this.prisma.album.findMany({
                where: {
                  name: {
                    in: candidateAlbumNames,
                  },
                },
                select: {
                  id: true,
                  name: true,
                  date: true,
                  coverHash: true,
                  artists: {
                    select: {
                      artist: {
                        select: {
                          name: true,
                        },
                      },
                    },
                    orderBy: {
                      order: "asc",
                    },
                  },
                  tracks: {
                    select: {
                      discNumber: true,
                      trackNumber: true,
                      isrc: true,
                      name: true,
                    },
                  },
                },
              })
            : [];

        const signatureToAlbumId = new Map<string, string>();
        const partialSignatureToAlbumId = new Map<string, string>();
        const coverHashByAlbumId = new Map<string, string>();
        for (const album of existingAlbums) {
          const albumArtistNames = album.artists.map(
            ({ artist }) => artist.name,
          );
          const trackCounts = getTrackCountsPerDisc(album.tracks);
          const trackKeys = getOrderedTrackKeys(
            album.tracks.map((t) => ({
              discNumber: t.discNumber,
              trackNumber: t.trackNumber,
              isrc: t.isrc,
              title: t.name,
            })),
          );

          signatureToAlbumId.set(
            getAlbumSignature(
              album.name,
              albumArtistNames,
              trackCounts,
              trackKeys,
            ),
            album.id,
          );

          coverHashByAlbumId.set(album.id, album.coverHash);

          // If an album exists without tracks yet, allow a fallback match.
          if (album.tracks.length === 0) {
            partialSignatureToAlbumId.set(
              getAlbumSignature(album.name, albumArtistNames, trackCounts, []),
              album.id,
            );
          }
        }

        const albumsToCreateBySignature = new Map<
          string,
          {
            readonly name: string;
            readonly artists: string[];
            readonly trackCounts: number[];
            readonly date: Temporal.PlainDate | null;
            readonly coverHash: string;
            readonly coverColors: AlbumCoverColors;
          }
        >();

        let matchedAlbumsCount = 0;
        for (const [folderPath, data] of albumCandidates) {
          const summary = data.albumSummary!;
          const albumDate = pickAlbumDateFromTrackDates(
            Object.values(data.files).map((f) => f.tags.DATE),
          );
          const trackKeys = getOrderedTrackKeys(
            Object.values(data.files).map((f) => ({
              discNumber: f.tags.DISCNUMBER,
              trackNumber: f.tags.TRACKNUMBER,
              isrc: f.tags.ISRC,
              title: f.tags.TITLE,
            })),
          );
          const signature = getAlbumSignature(
            summary.album,
            summary.artists,
            summary.trackCounts,
            trackKeys,
          );

          const existingAlbumId = signatureToAlbumId.get(signature);
          if (existingAlbumId) {
            context.sourceData[folderPath].albumId = existingAlbumId;
            matchedAlbumsCount += 1;
            continue;
          }

          const partialAlbumId = partialSignatureToAlbumId.get(
            getAlbumSignature(
              summary.album,
              summary.artists,
              summary.trackCounts,
              [],
            ),
          );
          if (partialAlbumId) {
            context.sourceData[folderPath].albumId = partialAlbumId;
            matchedAlbumsCount += 1;
            continue;
          }

          // A valid cover with colors is required to create a new album.
          if (
            !data.coverCandidatePath ||
            !data.coverHash ||
            !data.coverColors
          ) {
            continue;
          }

          if (!albumsToCreateBySignature.has(signature)) {
            albumsToCreateBySignature.set(signature, {
              name: summary.album,
              artists: summary.artists,
              trackCounts: summary.trackCounts,
              date: albumDate,
              coverHash: data.coverHash,
              coverColors: data.coverColors,
            });
          } else if (albumDate) {
            const existing = albumsToCreateBySignature.get(signature);
            const existingDate = existing?.date;
            const mergedDate =
              existingDate &&
              Temporal.PlainDate.compare(existingDate, albumDate) <= 0
                ? existingDate
                : albumDate;

            if (existing && mergedDate !== existingDate) {
              albumsToCreateBySignature.set(signature, {
                ...existing,
                date: mergedDate,
              });
            }
          }
        }

        const albumsToCreate = [...albumsToCreateBySignature.entries()];
        const createdAlbumIds = new Set<string>();
        if (albumsToCreate.length > 0) {
          const createdAlbums: Array<{
            readonly id: string;
            readonly coverHash: string;
          }> = await this.prisma.$transaction(
            albumsToCreate.map(([, album]) =>
              this.prisma.album.create({
                data: {
                  name: album.name,
                  date: album.date ? plainDateToDate(album.date) : null,
                  coverHash: album.coverHash,
                  coverColorVibrant: album.coverColors.vibrant,
                  coverColorDarkVibrant: album.coverColors.darkVibrant,
                  coverColorLightVibrant: album.coverColors.lightVibrant,
                  coverColorMuted: album.coverColors.muted,
                  coverColorDarkMuted: album.coverColors.darkMuted,
                  coverColorLightMuted: album.coverColors.lightMuted,
                  artists: {
                    create: album.artists.map((artistName, order) => ({
                      order,
                      artist: {
                        connect: {
                          name: artistName.trim(),
                        },
                      },
                    })),
                  },
                },
                select: {
                  id: true,
                  coverHash: true,
                },
              }),
            ),
          );

          for (const [index, created] of createdAlbums.entries()) {
            const [signature] = albumsToCreate[index];
            signatureToAlbumId.set(signature, created.id);
            coverHashByAlbumId.set(created.id, created.coverHash);
            createdAlbumIds.add(created.id);
          }

          // Assign newly created album IDs to folders
          let createdAssignedCount = 0;
          for (const [folderPath, data] of albumCandidates) {
            if (context.sourceData[folderPath].albumId) continue;
            const summary = data.albumSummary!;
            const signature = getAlbumSignature(
              summary.album,
              summary.artists,
              summary.trackCounts,
              getOrderedTrackKeys(
                Object.values(data.files).map((f) => ({
                  discNumber: f.tags.DISCNUMBER,
                  trackNumber: f.tags.TRACKNUMBER,
                  isrc: f.tags.ISRC,
                  title: f.tags.TITLE,
                })),
              ),
            );
            const createdAlbumId = signatureToAlbumId.get(signature);
            if (createdAlbumId) {
              context.sourceData[folderPath].albumId = createdAlbumId;
              createdAssignedCount += 1;
            }
          }

          this.logger.log(
            `Albums: created ${createdAlbums.length}, assigned ${createdAssignedCount} folder(s)`,
          );
        }

        this.logger.log(
          `Albums: matched ${matchedAlbumsCount} existing for ${albumCandidates.length} folder(s)`,
        );

        // 6.4 Set album date (computed from track dates)
        const desiredDateByAlbumId = new Map<string, Temporal.PlainDate>();
        for (const [folderPath, data] of albumCandidates) {
          const albumId = context.sourceData[folderPath].albumId;
          if (!albumId) continue;

          const desired = pickAlbumDateFromTrackDates(
            Object.values(data.files).map((f) => f.tags.DATE),
          );
          if (!desired) continue;

          const currentDesired = desiredDateByAlbumId.get(albumId);
          if (
            !currentDesired ||
            Temporal.PlainDate.compare(desired, currentDesired) < 0
          ) {
            desiredDateByAlbumId.set(albumId, desired);
          }
        }

        if (desiredDateByAlbumId.size > 0) {
          const albumIds = [...desiredDateByAlbumId.keys()];
          const dbAlbums = await this.prisma.album.findMany({
            where: {
              id: {
                in: albumIds,
              },
            },
            select: {
              id: true,
              date: true,
            },
          });

          const updates = dbAlbums
            .map((a) => {
              const desired = desiredDateByAlbumId.get(a.id);
              if (!desired) return null;
              if (
                a.date &&
                Temporal.PlainDate.compare(dateToPlainDate(a.date), desired) ===
                  0
              ) {
                return null;
              }
              return this.prisma.album.update({
                where: { id: a.id },
                data: { date: plainDateToDate(desired) },
              });
            })
            .filter((u) => u !== null);

          if (updates.length > 0) {
            await this.prisma.$transaction(updates);
          }
        }

        // 6.5 Generate/update album covers in intermediate path when needed
        const foldersWithCovers = Object.entries(context.sourceData).filter(
          ([, data]) =>
            typeof data.albumId === "string" &&
            data.albumId.length > 0 &&
            typeof data.coverCandidatePath === "string" &&
            typeof data.coverHash === "string" &&
            data.coverHash.length > 0 &&
            data.coverColors !== undefined,
        );

        if (foldersWithCovers.length > 0) {
          let checkedCoverFolders = 0;
          const markCoverChecked = async (
            folderPath: string,
            detailPrefix: string,
          ) => {
            checkedCoverFolders += 1;
            await this.updateStep(
              context,
              IndexingProgressStepKey.SYNC_ALBUMS,
              {
                current: checkedCoverFolders,
                total: foldersWithCovers.length,
                detail: `${detailPrefix} ${checkedCoverFolders} / ${foldersWithCovers.length}: ${this.toRelativePath(
                  context.libraryPath,
                  folderPath,
                )}`,
              },
            );
          };

          await this.updateStep(context, IndexingProgressStepKey.SYNC_ALBUMS, {
            current: 0,
            total: foldersWithCovers.length,
            detail: "Checking and generating album cover assets.",
          });

          const coverAlbumIds = [
            ...new Set(foldersWithCovers.map(([, d]) => d.albumId!)),
          ];

          const dbAlbums = await this.prisma.album.findMany({
            where: {
              id: {
                in: coverAlbumIds,
              },
            },
            select: {
              id: true,
              coverHash: true,
            },
          });

          const dbCoverHash = new Map<string, string>(
            dbAlbums.map((a) => [a.id, a.coverHash] as const),
          );

          for (const [folderPath, data] of foldersWithCovers) {
            const albumId = data.albumId!;
            const desiredHash = data.coverHash!;
            const coverColors = data.coverColors!;
            const currentHash = dbCoverHash.get(albumId) ?? "";

            const isNew = createdAlbumIds.has(albumId);
            const hasChanged = currentHash !== desiredHash;

            let detailPrefix = "Checked cover";
            if (!isNew && hasChanged) {
              // Update cover hash and colors when cover has changed
              await this.prisma.album.update({
                where: { id: albumId },
                data: {
                  coverHash: desiredHash,
                  coverColorVibrant: coverColors.vibrant,
                  coverColorDarkVibrant: coverColors.darkVibrant,
                  coverColorLightVibrant: coverColors.lightVibrant,
                  coverColorMuted: coverColors.muted,
                  coverColorDarkMuted: coverColors.darkMuted,
                  coverColorLightMuted: coverColors.lightMuted,
                },
              });
              dbCoverHash.set(albumId, desiredHash);
              detailPrefix = "Updated cover metadata";
            }

            if (!isNew && !hasChanged) {
              await markCoverChecked(folderPath, detailPrefix);
              continue;
            }

            try {
              const outputDir = path.resolve(
                this.appConf.intermediatePath,
                "albums",
                albumId,
              );
              // Create a fresh sharp instance for AVIF conversion
              // Colors were already extracted in step 4.5, so we only generate AVIF files here
              const srcImage = sharp(data.coverCandidatePath);
              await convertAlbumCoverCandidate(srcImage, outputDir);
              detailPrefix = isNew
                ? "Generated cover assets"
                : "Regenerated cover assets";
            } catch (error) {
              await this.addWarning(context, {
                type: IndexingReportType.WARNING_FOLDER_METADATA,
                folderPath: this.toRelativePath(
                  context.libraryPath,
                  folderPath,
                ),
                messages: [
                  "Failed to generate album cover AVIF variants.",
                  error instanceof Error ? error.message : "Unknown error",
                ],
              });
              detailPrefix = "Checked cover with warnings";
            }

            await markCoverChecked(folderPath, detailPrefix);
          }
        }
      }

      const syncAlbumsStep = this.getStep(
        context,
        IndexingProgressStepKey.SYNC_ALBUMS,
      );
      const completedSyncAlbumsTotal =
        syncAlbumsStep.total ?? albumCandidates.length;
      await this.completeStep(context, IndexingProgressStepKey.SYNC_ALBUMS, {
        current: completedSyncAlbumsTotal,
        total: completedSyncAlbumsTotal,
        detail: `Synchronized ${albumCandidates.length} album folder candidate(s).`,
      });

      // 7. Match and create tracks + link FLAC files

      const trackCandidates = Object.entries(context.sourceData).filter(
        ([, data]) =>
          !data.hasWarnings &&
          data.albumSummary !== undefined &&
          typeof data.albumId === "string" &&
          data.albumId.length > 0,
      );
      const totalTrackFiles = trackCandidates.reduce(
        (total, [, folderData]) => total + Object.keys(folderData.files).length,
        0,
      );
      await this.startStep(context, IndexingProgressStepKey.SYNC_TRACKS, {
        current: 0,
        total: totalTrackFiles,
        detail: "Creating/updating tracks and linked FLAC file records.",
      });
      let syncedTrackFiles = 0;

      if (trackCandidates.length > 0) {
        const albumIds = [
          ...new Set(trackCandidates.map(([, data]) => data.albumId!)),
        ];

        const existingTracks = await this.prisma.track.findMany({
          where: {
            albumId: {
              in: albumIds,
            },
          },
          select: {
            id: true,
            albumId: true,
            discNumber: true,
            trackNumber: true,
            name: true,
            isrc: true,
            date: true,
            durationMs: true,
            lyrics: true,
          },
        });

        const byAlbumDiscTrack = new Map<
          string,
          (typeof existingTracks)[number]
        >();
        const byAlbumIsrc = new Map<string, (typeof existingTracks)[number]>();
        const byAlbumTitle = new Map<string, (typeof existingTracks)[number]>();

        for (const t of existingTracks) {
          const discTrackKey = getAlbumDiscTrackKey(
            t.albumId ?? "",
            t.discNumber,
            t.trackNumber,
          );
          byAlbumDiscTrack.set(discTrackKey, t);

          const isrc = normalizeIsrc(t.isrc);
          if (isrc) {
            byAlbumIsrc.set(`${t.albumId}::isrc:${isrc}`, t);
          }

          const title = normalizeTitle(t.name);
          if (title) {
            byAlbumTitle.set(`${t.albumId}::title:${title}`, t);
          }
        }

        const allTrackArtistNames = new Set<string>();
        for (const [, data] of trackCandidates) {
          for (const file of Object.values(data.files)) {
            for (const artistName of file.tags.ARTIST) {
              const trimmed = artistName.trim();
              if (trimmed.length > 0) allTrackArtistNames.add(trimmed);
            }
          }
        }

        const artistNameToId = new Map<string, string>();
        if (allTrackArtistNames.size > 0) {
          const artists = await this.prisma.artist.findMany({
            where: {
              name: {
                in: [...allTrackArtistNames],
              },
            },
            select: {
              id: true,
              name: true,
            },
          });
          for (const a of artists) {
            artistNameToId.set(a.name, a.id);
          }
        }

        const toInt = (value: unknown): number => {
          const n = typeof value === "number" ? value : Number(value);
          return Number.isFinite(n) ? Math.trunc(n) : 0;
        };

        let createdTracks = 0;
        let updatedTracks = 0;
        let movedTracks = 0;
        let isrcConflicts = 0;
        let upsertedFlacFiles = 0;
        let deletedMissingFlacFiles = 0;

        for (const [folderAbsPath, folderData] of trackCandidates) {
          const albumId = folderData.albumId!;
          const folderRelative = this.toRelativePath(
            context.libraryPath,
            folderAbsPath,
          );

          const fileEntries = Object.entries(folderData.files)
            .map(([fileAbsPath, file]) => {
              const relativePath = this.toRelativePath(
                context.libraryPath,
                fileAbsPath,
              );

              const title = file.tags.TITLE;
              const isrc = normalizeIsrc(file.tags.ISRC);
              const artists = file.tags.ARTIST.map((a) => a.trim()).filter(
                (a) => a.length > 0,
              );

              return {
                relativePath,
                discNumber: toInt(file.tags.DISCNUMBER),
                trackNumber: toInt(file.tags.TRACKNUMBER),
                title,
                isrc,
                date: file.tags.DATE,
                durationMs: toInt(file.ffprobe.durationMs),
                artists,
                ffprobe: file.ffprobe,
                lyrics: file.lyrics,
              };
            })
            .sort((a, b) =>
              a.discNumber !== b.discNumber
                ? a.discNumber - b.discNumber
                : a.trackNumber - b.trackNumber,
            );

          const currentRelativePaths = fileEntries.map((f) => f.relativePath);
          const pendingFolderWarnings: string[] = [];

          await this.prisma.$transaction(async (tx) => {
            for (const f of fileEntries) {
              const isrcKey = f.isrc ? `${albumId}::isrc:${f.isrc}` : undefined;
              const titleKey =
                !f.isrc && normalizeTitle(f.title)
                  ? `${albumId}::title:${normalizeTitle(f.title)}`
                  : undefined;

              let matched =
                (isrcKey ? byAlbumIsrc.get(isrcKey) : undefined) ??
                (titleKey ? byAlbumTitle.get(titleKey) : undefined) ??
                byAlbumDiscTrack.get(
                  getAlbumDiscTrackKey(albumId, f.discNumber, f.trackNumber),
                );

              // If we matched by ISRC/title but slot differs, try moving (if slot free)
              if (
                matched &&
                (matched.discNumber !== f.discNumber ||
                  matched.trackNumber !== f.trackNumber)
              ) {
                const desiredKey = getAlbumDiscTrackKey(
                  albumId,
                  f.discNumber,
                  f.trackNumber,
                );

                if (!byAlbumDiscTrack.has(desiredKey)) {
                  const previousKey = getAlbumDiscTrackKey(
                    albumId,
                    matched.discNumber,
                    matched.trackNumber,
                  );

                  const moved = await tx.track.update({
                    where: { id: matched.id },
                    data: {
                      discNumber: f.discNumber,
                      trackNumber: f.trackNumber,
                    },
                    select: {
                      id: true,
                      albumId: true,
                      discNumber: true,
                      trackNumber: true,
                      name: true,
                      isrc: true,
                      date: true,
                      durationMs: true,
                      lyrics: true,
                    },
                  });

                  byAlbumDiscTrack.delete(previousKey);
                  byAlbumDiscTrack.set(desiredKey, moved);

                  // Update identity maps to point to the moved instance
                  const movedIdentity = getPreferredTrackIdentity({
                    isrc: moved.isrc,
                    title: moved.name,
                  });
                  if (movedIdentity?.startsWith("isrc:")) {
                    byAlbumIsrc.set(`${albumId}::${movedIdentity}`, moved);
                  }
                  if (movedIdentity?.startsWith("title:")) {
                    byAlbumTitle.set(`${albumId}::${movedIdentity}`, moved);
                  }

                  matched = moved;
                  movedTracks += 1;
                }
              }

              let trackId: string;
              if (matched) {
                const plan = getTrackUpdatePlan(
                  {
                    name: matched.name,
                    isrc: matched.isrc,
                    durationMs: matched.durationMs,
                  },
                  {
                    title: f.title,
                    isrc: f.isrc,
                    durationMs: f.durationMs,
                  },
                );

                if (plan.hasIsrcConflict) {
                  isrcConflicts += 1;
                  pendingFolderWarnings.push(
                    `ISRC conflict for disc=${f.discNumber} track=${f.trackNumber}: db=${matched.isrc ?? "<null>"} file=${f.isrc ?? "<null>"}`,
                  );
                }

                const shouldUpdateDate =
                  f.date !== null &&
                  f.date !== undefined &&
                  (!matched.date ||
                    Temporal.PlainDate.compare(
                      dateToPlainDate(matched.date),
                      f.date,
                    ) !== 0);

                // TODO: Implement proper lyrics comparison that handles property ordering
                // Currently always updates tracks with lyrics to ensure changes are detected
                const shouldUpdateLyrics =
                  matched.lyrics !== null || f.lyrics !== null;

                if (
                  Object.keys(plan.patch).length > 0 ||
                  shouldUpdateDate ||
                  shouldUpdateLyrics
                ) {
                  const updated = await tx.track.update({
                    where: { id: matched.id },
                    data: {
                      ...plan.patch,
                      isrc: plan.patch.isrc ?? undefined,
                      date: shouldUpdateDate
                        ? plainDateToDate(f.date!)
                        : undefined,
                      lyrics: f.lyrics ?? Prisma.JsonNull,
                    },
                    select: {
                      id: true,
                      albumId: true,
                      discNumber: true,
                      trackNumber: true,
                      name: true,
                      isrc: true,
                      date: true,
                      durationMs: true,
                      lyrics: true,
                    },
                  });

                  const discTrackKey = getAlbumDiscTrackKey(
                    albumId,
                    updated.discNumber,
                    updated.trackNumber,
                  );
                  byAlbumDiscTrack.set(discTrackKey, updated);

                  const updatedIdentity = getPreferredTrackIdentity({
                    isrc: updated.isrc,
                    title: updated.name,
                  });
                  if (updatedIdentity?.startsWith("isrc:")) {
                    byAlbumIsrc.set(`${albumId}::${updatedIdentity}`, updated);
                  }
                  if (updatedIdentity?.startsWith("title:")) {
                    byAlbumTitle.set(`${albumId}::${updatedIdentity}`, updated);
                  }

                  matched = updated;
                  updatedTracks += 1;
                }

                trackId = matched.id;
              } else {
                const created = await tx.track.create({
                  data: {
                    album: { connect: { id: albumId } },
                    discNumber: f.discNumber,
                    trackNumber: f.trackNumber,
                    name: normalizeTitle(f.title) ?? f.title,
                    isrc: f.isrc ?? null,
                    date: f.date ? plainDateToDate(f.date) : null,
                    durationMs: f.durationMs,
                    lyrics: f.lyrics ?? Prisma.JsonNull,
                  },
                  select: {
                    id: true,
                    albumId: true,
                    discNumber: true,
                    trackNumber: true,
                    name: true,
                    isrc: true,
                    date: true,
                    durationMs: true,
                    lyrics: true,
                  },
                });

                createdTracks += 1;
                trackId = created.id;

                byAlbumDiscTrack.set(
                  getAlbumDiscTrackKey(
                    albumId,
                    created.discNumber,
                    created.trackNumber,
                  ),
                  created,
                );

                const createdIdentity = getPreferredTrackIdentity({
                  isrc: created.isrc,
                  title: created.name,
                });
                if (createdIdentity?.startsWith("isrc:")) {
                  byAlbumIsrc.set(`${albumId}::${createdIdentity}`, created);
                }
                if (createdIdentity?.startsWith("title:")) {
                  byAlbumTitle.set(`${albumId}::${createdIdentity}`, created);
                }
              }

              // TrackArtist: reset to exactly match file ARTIST order
              await tx.trackArtist.deleteMany({
                where: {
                  trackId,
                },
              });

              const uniqueArtistIds: string[] = [];
              const seenArtistIds = new Set<string>();
              for (const artistName of f.artists) {
                const artistId = artistNameToId.get(artistName);
                if (!artistId) continue;
                if (seenArtistIds.has(artistId)) continue;
                seenArtistIds.add(artistId);
                uniqueArtistIds.push(artistId);
              }

              if (uniqueArtistIds.length > 0) {
                await tx.trackArtist.createMany({
                  data: uniqueArtistIds.map((artistId, order) => ({
                    trackId,
                    artistId,
                    order,
                  })),
                });
              }

              // FlacFile: enforce 0..1 file per track
              await tx.flacFile.deleteMany({
                where: {
                  trackId,
                  relativePath: {
                    not: f.relativePath,
                  },
                },
              });

              await tx.flacFile.upsert({
                where: {
                  relativePath: f.relativePath,
                },
                create: {
                  relativePath: f.relativePath,
                  sampleRate: toInt(f.ffprobe.sampleRate),
                  bitsPerRawSample: toInt(f.ffprobe.bitsPerRawSample),
                  durationMs: toInt(f.ffprobe.durationMs),
                  fileSize: toInt(f.ffprobe.fileSize),
                  bitRate: toInt(f.ffprobe.bitRate),
                  track: {
                    connect: {
                      id: trackId,
                    },
                  },
                },
                update: {
                  sampleRate: toInt(f.ffprobe.sampleRate),
                  bitsPerRawSample: toInt(f.ffprobe.bitsPerRawSample),
                  durationMs: toInt(f.ffprobe.durationMs),
                  fileSize: toInt(f.ffprobe.fileSize),
                  bitRate: toInt(f.ffprobe.bitRate),
                  track: {
                    connect: {
                      id: trackId,
                    },
                  },
                },
              });

              upsertedFlacFiles += 1;
            }

            // Delete disappeared FLAC files from this folder
            const deleted = await tx.flacFile.deleteMany({
              where: {
                AND: [
                  {
                    relativePath: {
                      startsWith: `${folderRelative}/`,
                    },
                  },
                  {
                    relativePath: {
                      notIn: currentRelativePaths,
                    },
                  },
                ],
              },
            });
            deletedMissingFlacFiles += deleted.count;
          });

          if (pendingFolderWarnings.length > 0) {
            await this.addWarning(context, {
              type: IndexingReportType.WARNING_FOLDER_METADATA,
              folderPath: this.toRelativePath(
                context.libraryPath,
                folderAbsPath,
              ),
              messages: pendingFolderWarnings,
            });
          }

          syncedTrackFiles += fileEntries.length;
          await this.updateStep(context, IndexingProgressStepKey.SYNC_TRACKS, {
            current: syncedTrackFiles,
            total: totalTrackFiles,
            detail: folderRelative,
          });
        }

        this.logger.log(
          `Tracks: created=${createdTracks} updated=${updatedTracks} moved=${movedTracks} isrcConflicts=${isrcConflicts} | FlacFile: upserted=${upsertedFlacFiles} deletedMissing=${deletedMissingFlacFiles}`,
        );
      }
      await this.completeStep(context, IndexingProgressStepKey.SYNC_TRACKS, {
        current: syncedTrackFiles,
        total: totalTrackFiles,
        detail: `Synchronized ${syncedTrackFiles} / ${totalTrackFiles} FLAC file link(s).`,
      });

      // ------------------------------------------------

      // TODO: split into mote testable functions
      // TODO: extract album date
      // TODO: convert covers
      // TODO: switch cuid to uuid v7 (?)
      // TODO: when an album is deleted, delete associated tracks

      // Covers are generated during album matching/creation.

      this.logger.log(
        `Indexing job ${job.id} completed with ${context.warnings.length} reportable issue(s)`,
      );
      await job.updateProgress(100);
      await this.publishJobStatus(
        job,
        IndexingJobStatus.COMPLETED,
        100,
        context,
      );
      return {
        ok: true,
        folders: context.sourceData,
        warnings: context.warnings,
      };
    } catch (error) {
      await this.failRunningStep(context);
      const message =
        error instanceof Error ? error.message : "Unknown indexing failure";
      await this.addReport(context, {
        level: IndexingReportLevel.ERROR,
        type: IndexingReportType.ERROR_INDEXING_FAILED,
        message: `Library indexing failed: ${message}`,
      });
      await this.publishJobStatus(
        job,
        IndexingJobStatus.FAILED,
        this.calculateOverallProgress(context.steps),
        context,
      );
      throw error;
    }
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
        `Inconsistent ALBUM values: ${[...albumSet].join(", ")}`,
      );
    }

    // 2. ALBUMARTIST consistency
    const albumArtistSet = new Set(
      fileArray.map((f) => JSON.stringify(f.tags.ALBUMARTIST)),
    );
    if (albumArtistSet.size > 1) {
      metadataIssues.push(
        `Inconsistent ALBUMARTIST values: ${[...albumArtistSet].join(", ")}`,
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
        `Inconsistent DISCNUMBER totals: ${[...uniqueTotals].join(", ")}`,
      );
    }

    return metadataIssues;
  }

  private async addWarning(
    context: IndexingProcessorContext,
    warning: IndexingWarning,
  ) {
    context.warnings.push(warning);
    context.reports.push(this.warningToReport(warning));
    await this.persistJobData(context);
    await this.publishJobStatus(
      context.job,
      IndexingJobStatus.ACTIVE,
      this.getJobProgress(context.job),
      context,
    );
  }

  private createInitialSteps(): IndexingProgressStep[] {
    return [
      {
        key: IndexingProgressStepKey.DISCOVER_FLAC_FOLDERS,
        label: "Discover FLAC folders",
        status: IndexingProgressStepStatus.PENDING,
      },
      {
        key: IndexingProgressStepKey.EXTRACT_METADATA,
        label: "Extract metadata",
        status: IndexingProgressStepStatus.PENDING,
      },
      {
        key: IndexingProgressStepKey.VALIDATE_METADATA,
        label: "Validate metadata",
        status: IndexingProgressStepStatus.PENDING,
      },
      {
        key: IndexingProgressStepKey.ANALYZE_COVERS,
        label: "Analyze covers",
        status: IndexingProgressStepStatus.PENDING,
      },
      {
        key: IndexingProgressStepKey.SYNC_ARTISTS,
        label: "Sync artists",
        status: IndexingProgressStepStatus.PENDING,
      },
      {
        key: IndexingProgressStepKey.SYNC_ALBUMS,
        label: "Sync albums and covers",
        status: IndexingProgressStepStatus.PENDING,
      },
      {
        key: IndexingProgressStepKey.SYNC_TRACKS,
        label: "Sync tracks and files",
        status: IndexingProgressStepStatus.PENDING,
      },
    ];
  }

  private async startStep(
    context: IndexingProcessorContext,
    key: IndexingProgressStepKey,
    patch: Partial<IndexingProgressStep> = {},
  ) {
    const step = this.getStep(context, key);
    await this.updateStep(context, key, {
      current: patch.current ?? step.current ?? 0,
      total: patch.total,
      detail: patch.detail,
      status: IndexingProgressStepStatus.RUNNING,
    });
  }

  private async completeStep(
    context: IndexingProcessorContext,
    key: IndexingProgressStepKey,
    patch: Partial<IndexingProgressStep> = {},
  ) {
    const step = this.getStep(context, key);
    await this.updateStep(context, key, {
      current: patch.current ?? patch.total ?? step.total ?? step.current ?? 0,
      total: patch.total ?? step.total,
      detail: patch.detail,
      status: IndexingProgressStepStatus.COMPLETED,
    });
  }

  private async skipRemainingSteps(context: IndexingProcessorContext) {
    for (const step of context.steps) {
      if (step.status !== IndexingProgressStepStatus.PENDING) {
        continue;
      }

      await this.updateStep(context, step.key, {
        current: 0,
        total: 0,
        status: IndexingProgressStepStatus.SKIPPED,
        detail: "Skipped because there was nothing to index.",
      });
    }
  }

  private async failRunningStep(context: IndexingProcessorContext) {
    const runningStep = context.steps.find(
      (step) => step.status === IndexingProgressStepStatus.RUNNING,
    );

    if (!runningStep) {
      return;
    }

    await this.updateStep(context, runningStep.key, {
      status: IndexingProgressStepStatus.FAILED,
      detail: "Indexing failed during this step.",
    });
  }

  private async updateStep(
    context: IndexingProcessorContext,
    key: IndexingProgressStepKey,
    patch: Partial<IndexingProgressStep>,
  ) {
    const stepIndex = context.steps.findIndex((step) => step.key === key);

    if (stepIndex === -1) {
      return;
    }

    context.steps.splice(stepIndex, 1, {
      ...context.steps[stepIndex],
      ...patch,
    });

    const progress = this.calculateOverallProgress(context.steps);
    await context.job.updateProgress(progress);
    await this.persistJobData(context);
    await this.publishJobStatus(
      context.job,
      IndexingJobStatus.ACTIVE,
      progress,
      context,
    );
  }

  private getStep(
    context: IndexingProcessorContext,
    key: IndexingProgressStepKey,
  ): IndexingProgressStep {
    const step = context.steps.find((item) => item.key === key);

    if (!step) {
      return {
        key,
        label: key,
        status: IndexingProgressStepStatus.PENDING,
      };
    }

    return step;
  }

  private async addReport(
    context: IndexingProcessorContext,
    report: Omit<IndexingReportItem, "id" | "emittedAt">,
  ) {
    context.reports.push({
      ...report,
      id: `${Date.now()}-${crypto.randomUUID()}`,
      emittedAt: new Date().toISOString(),
    });
    await this.persistJobData(context);
    await this.publishJobStatus(
      context.job,
      IndexingJobStatus.ACTIVE,
      this.getJobProgress(context.job),
      context,
    );
  }

  private warningToReport(warning: IndexingWarning): IndexingReportItem {
    const base = {
      id: `${Date.now()}-${crypto.randomUUID()}`,
      emittedAt: new Date().toISOString(),
    };

    switch (warning.type) {
      case IndexingReportType.ERROR_METAFLAC_PARSING:
        return {
          ...base,
          level: IndexingReportLevel.ERROR,
          type: warning.type,
          path: warning.filePath,
          message: `Failed to parse FLAC metadata for ${warning.filePath}.`,
          details: [warning.errorMessage],
        };
      case IndexingReportType.ERROR_LYRICS_PARSING:
        return {
          ...base,
          level: IndexingReportLevel.ERROR,
          type: warning.type,
          path: warning.filePath,
          message: `Failed to parse lyrics for ${warning.filePath}.`,
          details: [warning.errorMessage],
        };
      case IndexingReportType.WARNING_SUBDIRECTORIES:
        return {
          ...base,
          level: IndexingReportLevel.WARNING,
          type: warning.type,
          path: warning.dirPath,
          message: `Nested directories under ${warning.dirPath} were skipped.`,
        };
      case IndexingReportType.WARNING_FOLDER_METADATA:
        return {
          ...base,
          level: IndexingReportLevel.WARNING,
          type: warning.type,
          path: warning.folderPath,
          message: `${warning.folderPath}: ${warning.messages.join("; ")}`,
          details: warning.messages,
        };
    }
  }

  private async persistJobData(context: IndexingProcessorContext) {
    await context.job.updateData({
      ...(context.job.data ?? {}),
      warnings: context.warnings,
      reports: context.reports,
      steps: context.steps,
      startedAt: context.startedAt,
      updatedAt: new Date().toISOString(),
    });
  }

  private calculateOverallProgress(steps: readonly IndexingProgressStep[]) {
    if (steps.length === 0) {
      return 0;
    }

    const progress = steps.reduce((total, step) => {
      switch (step.status) {
        case IndexingProgressStepStatus.COMPLETED:
        case IndexingProgressStepStatus.SKIPPED:
          return total + 1;
        case IndexingProgressStepStatus.FAILED:
          return total + 1;
        case IndexingProgressStepStatus.RUNNING:
          if (
            typeof step.current === "number" &&
            typeof step.total === "number" &&
            step.total > 0
          ) {
            return total + Math.min(1, step.current / step.total);
          }
          return total + 0.1;
        case IndexingProgressStepStatus.PENDING:
          return total;
      }
    }, 0);

    return Math.round((progress / steps.length) * 100);
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
    context: IndexingProcessorContext,
  ) {
    const errorReport = context.reports
      .toReversed()
      .find((report) => report.level === IndexingReportLevel.ERROR);

    await this.pubSub.publish(INDEXING_JOB_UPDATED, {
      indexingJobUpdated: {
        jobId: job.id,
        status,
        progress,
        startedAt: new Date(context.startedAt),
        updatedAt: new Date(),
        error:
          status === IndexingJobStatus.FAILED
            ? (job.failedReason ?? errorReport?.message)
            : job.failedReason,
        steps: context.steps,
        reports: context.reports.map((report) => ({
          ...report,
          emittedAt: new Date(report.emittedAt),
        })),
        warnings: context.warnings,
        completedAt:
          status === IndexingJobStatus.COMPLETED ? new Date() : undefined,
      },
    });
  }
}
