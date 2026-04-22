import { Injectable, NotFoundException } from "@nestjs/common";

import type { Lyrics } from "@oktomusic/lyrics";

import { PrismaService } from "../../db/prisma.service";
import type { AlbumBasicModel } from "../album/album.model";
import type { ArtistModel } from "../artist/artist.model";
import type { SearchTracksInput } from "./dto/search-tracks.input";
import { TrackModel } from "./track.model";

type PrismaArtistJoin = {
  order: number;
  artist: { id: string; name: string };
};

type PrismaAlbumBasic = {
  id: string;
  name: string;
  date: Date | null;
  coverColorVibrant: string;
  coverColorDarkVibrant: string;
  coverColorLightVibrant: string;
  coverColorMuted: string;
  coverColorDarkMuted: string;
  coverColorLightMuted: string;
  artists: PrismaArtistJoin[];
};

export type PrismaTrack = {
  id: string;
  name: string;
  isrc: string | null;
  date: Date | null;
  durationMs: number;
  albumId: string | null;
  discNumber: number;
  trackNumber: number;
  lyrics: Lyrics | null;
  flacFile?: { id: string } | null;
  artists: PrismaArtistJoin[];
  album?: PrismaAlbumBasic | null;
};

const trackInclude = {
  flacFile: { select: { id: true } },
  artists: {
    include: { artist: true },
    orderBy: { order: "asc" as const },
  },
  album: {
    include: {
      artists: {
        include: { artist: true },
        orderBy: { order: "asc" as const },
      },
    },
  },
} as const;

@Injectable()
export class TrackService {
  constructor(private readonly prisma: PrismaService) {}

  private mapArtists(artists: PrismaArtistJoin[]): ArtistModel[] {
    return artists.map((a) => ({ id: a.artist.id, name: a.artist.name }));
  }

  private mapAlbumBasic(album: PrismaAlbumBasic): AlbumBasicModel {
    return {
      id: album.id,
      name: album.name,
      date: album.date,
      artists: this.mapArtists(album.artists),
      coverColorVibrant: album.coverColorVibrant,
      coverColorDarkVibrant: album.coverColorDarkVibrant,
      coverColorLightVibrant: album.coverColorLightVibrant,
      coverColorMuted: album.coverColorMuted,
      coverColorDarkMuted: album.coverColorDarkMuted,
      coverColorLightMuted: album.coverColorLightMuted,
    };
  }

  public mapTrack(track: PrismaTrack): TrackModel {
    const lyrics = track.lyrics ?? null;
    const hasLyrics = Array.isArray(lyrics) && lyrics.length > 0;

    return {
      id: track.id,
      name: track.name,
      isrc: track.isrc,
      date: track.date,
      durationMs: track.durationMs,
      albumId: track.albumId,
      album: track.album ? this.mapAlbumBasic(track.album) : null,
      discNumber: track.discNumber,
      trackNumber: track.trackNumber,
      artists: this.mapArtists(track.artists),
      flacFileId: track.flacFile?.id ?? null,
      hasLyrics,
      lyrics: hasLyrics ? lyrics : null,
    };
  }

  async getTrack(id: string): Promise<TrackModel> {
    const track = await this.prisma.track.findUnique({
      where: { id },
      include: trackInclude,
    });

    if (!track) {
      throw new NotFoundException(`Track with id ${id} not found`);
    }

    return this.mapTrack(track);
  }

  async searchTracks(input: SearchTracksInput): Promise<TrackModel[]> {
    const limit = input.limit ?? 50;
    const offset = input.offset ?? 0;

    const tracks = await this.prisma.track.findMany({
      where: {
        ...(input.name && {
          name: { contains: input.name, mode: "insensitive" },
        }),
        ...(input.albumId && { albumId: input.albumId }),
        ...(input.artistId && {
          artists: { some: { artistId: input.artistId } },
        }),
      },
      include: trackInclude,
      orderBy: [{ name: "asc" }],
      take: limit,
      skip: offset,
    });

    return tracks.map((t) => this.mapTrack(t));
  }
}
