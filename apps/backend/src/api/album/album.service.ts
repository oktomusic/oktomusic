import fs from "node:fs";
import path from "node:path";

import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { type ConfigType } from "@nestjs/config";

import appConfig from "../../config/definitions/app.config";
import { Prisma } from "../../generated/prisma/client";
import { PrismaService } from "../../db/prisma.service";
import { AlbumCoverSizeString } from "../../common/utils/sharp-utils";
import { AlbumModel } from "./album.model";
import type { SearchAlbumsInput } from "./dto/search-albums.input";
import { type LyricsLineModel, TrackModel } from "../track/track.model";

const albumInclude = {
  artists: {
    include: { artist: true },
    orderBy: { order: "asc" as const },
  },
  tracks: {
    include: {
      flacFile: { select: { id: true } },
      artists: {
        include: { artist: true },
        orderBy: { order: "asc" as const },
      },
    },
    orderBy: [{ discNumber: "asc" as const }, { trackNumber: "asc" as const }],
  },
};

type PrismaAlbumFull = Prisma.AlbumGetPayload<{ include: typeof albumInclude }>;

@Injectable()
export class AlbumService {
  private albumCoverPath: string;

  constructor(
    @Inject(appConfig.KEY)
    private readonly appConf: ConfigType<typeof appConfig>,
    private readonly prisma: PrismaService,
  ) {
    this.albumCoverPath = path.resolve(this.appConf.intermediatePath, "albums");
  }

  /**
   * Resolve the file path for an album cover image from CUID and requested size.
   */
  public findAlbumCoverPath(
    cuid: string,
    size: AlbumCoverSizeString,
  ): string | null {
    const albumDir = path.resolve(this.albumCoverPath, cuid);

    if (!fs.existsSync(albumDir)) {
      return null;
    }

    const coverPath = path.resolve(albumDir, `cover_${size}.avif`);
    if (!fs.existsSync(coverPath)) {
      return null;
    }

    return coverPath;
  }

  private buildAlbumModel(album: PrismaAlbumFull): AlbumModel {
    const tracksByDiscMap = new Map<number, TrackModel[]>();

    for (const track of album.tracks) {
      const lyrics = track.lyrics ?? null;
      const hasLyrics = Array.isArray(lyrics) && lyrics.length > 0;
      const mappedTrack: TrackModel = {
        id: track.id,
        name: track.name,
        isrc: track.isrc,
        date: track.date,
        durationMs: track.durationMs,
        albumId: track.albumId,
        album: null,
        discNumber: track.discNumber,
        trackNumber: track.trackNumber,
        artists: track.artists.map((a) => ({
          id: a.artist.id,
          name: a.artist.name,
        })),
        flacFileId: track.flacFile?.id ?? null,
        hasLyrics,
        lyrics: hasLyrics ? (lyrics as LyricsLineModel[]) : null,
      };
      const discTracks = tracksByDiscMap.get(track.discNumber) ?? [];
      discTracks.push(mappedTrack);
      tracksByDiscMap.set(track.discNumber, discTracks);
    }

    const sortedDiscNumbers = Array.from(tracksByDiscMap.keys()).sort(
      (a, b) => a - b,
    );

    return {
      id: album.id,
      name: album.name,
      date: album.date,
      artists: album.artists.map((a) => ({
        id: a.artist.id,
        name: a.artist.name,
      })),
      coverColorVibrant: album.coverColorVibrant,
      coverColorDarkVibrant: album.coverColorDarkVibrant,
      coverColorLightVibrant: album.coverColorLightVibrant,
      coverColorMuted: album.coverColorMuted,
      coverColorDarkMuted: album.coverColorDarkMuted,
      coverColorLightMuted: album.coverColorLightMuted,
      tracksByDisc: sortedDiscNumbers.map((disc) => tracksByDiscMap.get(disc)!),
    };
  }

  /**
   * Fetch album details by CUID, including artists and tracks grouped by disc number, for GraphQL API.
   */
  public async getAlbumGql(cuid: string): Promise<AlbumModel> {
    const album = await this.prisma.album.findUnique({
      where: { id: cuid },
      include: albumInclude,
    });

    if (!album) {
      throw new NotFoundException(`Album with id ${cuid} not found`);
    }

    return this.buildAlbumModel(album);
  }

  public async searchAlbums(input: SearchAlbumsInput): Promise<AlbumModel[]> {
    const limit = input.limit ?? 50;
    const offset = input.offset ?? 0;

    const albums = await this.prisma.album.findMany({
      where: {
        ...(input.name && {
          name: { contains: input.name, mode: "insensitive" },
        }),
        ...(input.artistId && {
          artists: { some: { artistId: input.artistId } },
        }),
      },
      include: albumInclude,
      orderBy: [{ name: "asc" }],
      take: limit,
      skip: offset,
    });

    return albums.map((album) => this.buildAlbumModel(album));
  }
}
