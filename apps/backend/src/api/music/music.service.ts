import { Injectable, NotFoundException } from "@nestjs/common";

import { Prisma } from "../../generated/prisma/client";

import { PrismaService } from "../../db/prisma.service";
import type {
  AlbumBasicModel,
  AlbumModel,
  ArtistModel,
  TrackModel,
} from "./music.model";
import type {
  SearchAlbumsInput,
  SearchArtistsInput,
  SearchMusicInput,
  SearchTracksInput,
} from "./dto/search-music.input";

type PrismaTrack = {
  id: string;
  name: string;
  isrc: string | null;
  date: Date | null;
  durationMs: number;
  albumId: string | null;
  discNumber: number;
  trackNumber: number;
  artists: {
    order: number;
    artist: {
      id: string;
      name: string;
    };
  }[];
  album?: {
    id: string;
    name: string;
    date: Date | null;
    artists: {
      order: number;
      artist: {
        id: string;
        name: string;
      };
    }[];
  } | null;
};

@Injectable()
export class MusicService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Map artist associations to artist models
   */
  private mapArtists(
    artists: Array<{ order: number; artist: { id: string; name: string } }>,
  ): ArtistModel[] {
    return artists.map((aa) => ({
      id: aa.artist.id,
      name: aa.artist.name,
    }));
  }

  /**
   * Map album basic info to album basic model
   */
  private mapAlbumBasic(album: {
    id: string;
    name: string;
    date: Date | null;
    artists: Array<{ order: number; artist: { id: string; name: string } }>;
  }): AlbumBasicModel {
    return {
      id: album.id,
      name: album.name,
      date: album.date,
      artists: this.mapArtists(album.artists),
    };
  }

  /**
   * Map Prisma track to track model
   */
  private mapTrack(track: PrismaTrack): TrackModel {
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
    };
  }

  /**
   * Group tracks by disc number
   */
  private groupTracksByDisc(tracks: PrismaTrack[]): TrackModel[][] {
    const tracksByDiscMap = new Map<number, TrackModel[]>();

    for (const track of tracks) {
      const discTracks = tracksByDiscMap.get(track.discNumber) ?? [];
      discTracks.push(this.mapTrack(track));
      tracksByDiscMap.set(track.discNumber, discTracks);
    }

    // Convert map to sorted array
    const sortedDiscNumbers = Array.from(tracksByDiscMap.keys()).sort(
      (a, b) => a - b,
    );
    return sortedDiscNumbers.map((disc) => tracksByDiscMap.get(disc)!);
  }

  /**
   * Map Prisma album to album model
   */
  private mapAlbum(album: {
    id: string;
    name: string;
    date: Date | null;
    artists: Array<{ order: number; artist: { id: string; name: string } }>;
    tracks: PrismaTrack[];
  }): AlbumModel {
    return {
      id: album.id,
      name: album.name,
      date: album.date,
      artists: this.mapArtists(album.artists),
      tracksByDisc: this.groupTracksByDisc(album.tracks),
    };
  }

  /**
   * Map standalone artist to artist model
   */
  private mapArtist(artist: { id: string; name: string }): ArtistModel {
    return {
      id: artist.id,
      name: artist.name,
    };
  }

  async getTrack(id: string): Promise<TrackModel> {
    const track = await this.prisma.track.findUnique({
      where: { id },
      include: {
        artists: {
          include: {
            artist: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        album: {
          include: {
            artists: {
              include: {
                artist: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    if (!track) {
      throw new NotFoundException(`Track with id ${id} not found`);
    }

    return this.mapTrack(track);
  }

  async getAlbum(id: string): Promise<AlbumModel> {
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: {
        artists: {
          include: {
            artist: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        tracks: {
          include: {
            artists: {
              include: {
                artist: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: [{ discNumber: "asc" }, { trackNumber: "asc" }],
        },
      },
    });

    if (!album) {
      throw new NotFoundException(`Album with id ${id} not found`);
    }

    return this.mapAlbum(album);
  }

  async getArtist(id: string): Promise<ArtistModel> {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException(`Artist with id ${id} not found`);
    }

    return this.mapArtist(artist);
  }

  async searchTracks(input: SearchTracksInput): Promise<TrackModel[]> {
    const limit = input.limit ?? 50;
    const offset = input.offset ?? 0;

    const tracks = await this.prisma.track.findMany({
      where: {
        ...(input.name && {
          name: {
            contains: input.name,
            mode: "insensitive",
          },
        }),
        ...(input.albumId && { albumId: input.albumId }),
        ...(input.artistId && {
          artists: {
            some: {
              artistId: input.artistId,
            },
          },
        }),
      },
      include: {
        artists: {
          include: {
            artist: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        album: {
          include: {
            artists: {
              include: {
                artist: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
      orderBy: [{ name: "asc" }],
      take: limit,
      skip: offset,
    });

    return tracks.map((track) => this.mapTrack(track));
  }

  async searchAlbums(input: SearchAlbumsInput): Promise<AlbumModel[]> {
    const limit = input.limit ?? 50;
    const offset = input.offset ?? 0;

    const albums = await this.prisma.album.findMany({
      where: {
        ...(input.name && {
          name: {
            contains: input.name,
            mode: "insensitive",
          },
        }),
        ...(input.artistId && {
          artists: {
            some: {
              artistId: input.artistId,
            },
          },
        }),
      },
      include: {
        artists: {
          include: {
            artist: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        tracks: {
          include: {
            artists: {
              include: {
                artist: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: [{ discNumber: "asc" }, { trackNumber: "asc" }],
        },
      },
      orderBy: [{ name: "asc" }],
      take: limit,
      skip: offset,
    });

    return albums.map((album) => this.mapAlbum(album));
  }

  async searchArtists(input: SearchArtistsInput): Promise<ArtistModel[]> {
    const limit = input.limit ?? 50;
    const offset = input.offset ?? 0;

    const artists = await this.prisma.artist.findMany({
      where: {
        ...(input.name && {
          name: {
            contains: input.name,
            mode: "insensitive",
          },
        }),
      },
      orderBy: [{ name: "asc" }],
      take: limit,
      skip: offset,
    });

    return artists.map((artist) => this.mapArtist(artist));
  }

  /**
   * Search across all music entities (tracks, albums, artists) with flexible filtering.
   * Note: The limit is applied to each entity type separately, so the total results
   * may be up to 3x the limit value (e.g., limit=50 can return up to 150 total items).
   * Entity types can be selectively included/excluded via input flags.
   */
  async searchMusic(input: SearchMusicInput): Promise<{
    tracks: TrackModel[];
    albums: AlbumModel[];
    artists: ArtistModel[];
  }> {
    const limit = input.limit ?? 50;
    const offset = input.offset ?? 0;
    const includeTracks = input.includeTracks ?? true;
    const includeAlbums = input.includeAlbums ?? true;
    const includeArtists = input.includeArtists ?? true;

    // Build base where conditions
    const trackWhere: Prisma.TrackWhereInput = {};
    const albumWhere: Prisma.AlbumWhereInput = {};
    const artistWhere: Prisma.ArtistWhereInput = {};

    // Apply filters
    if (input.trackName) {
      trackWhere.name = {
        contains: input.trackName,
        mode: "insensitive",
      };
    }

    if (input.albumName) {
      albumWhere.name = {
        contains: input.albumName,
        mode: "insensitive",
      };
    }

    if (input.artistName) {
      artistWhere.name = {
        contains: input.artistName,
        mode: "insensitive",
      };
    }

    if (input.artistId) {
      trackWhere.artists = {
        some: {
          artistId: input.artistId,
        },
      };
      albumWhere.artists = {
        some: {
          artistId: input.artistId,
        },
      };
    }

    if (input.albumId) {
      trackWhere.albumId = input.albumId;
    }

    // Execute queries in parallel, only for requested entity types
    const trackPromise = includeTracks
      ? this.prisma.track.findMany({
          where: trackWhere,
          include: {
            artists: {
              include: {
                artist: true,
              },
              orderBy: {
                order: "asc",
              },
            },
            album: {
              include: {
                artists: {
                  include: {
                    artist: true,
                  },
                  orderBy: {
                    order: "asc",
                  },
                },
              },
            },
          },
          orderBy: [{ name: "asc" }],
          take: limit,
          skip: offset,
        })
      : Promise.resolve([]);

    const albumPromise = includeAlbums
      ? this.prisma.album.findMany({
          where: albumWhere,
          include: {
            artists: {
              include: {
                artist: true,
              },
              orderBy: {
                order: "asc",
              },
            },
            tracks: {
              include: {
                artists: {
                  include: {
                    artist: true,
                  },
                  orderBy: {
                    order: "asc",
                  },
                },
              },
              orderBy: [{ discNumber: "asc" }, { trackNumber: "asc" }],
            },
          },
          orderBy: [{ name: "asc" }],
          take: limit,
          skip: offset,
        })
      : Promise.resolve([]);

    const artistPromise = includeArtists
      ? this.prisma.artist.findMany({
          where: artistWhere,
          orderBy: [{ name: "asc" }],
          take: limit,
          skip: offset,
        })
      : Promise.resolve([]);

    const [tracks, albums, artists] = await Promise.all([
      trackPromise,
      albumPromise,
      artistPromise,
    ]);

    return {
      tracks: tracks.map((track) => this.mapTrack(track)),
      albums: albums.map((album) => this.mapAlbum(album)),
      artists: artists.map((artist) => this.mapArtist(artist)),
    };
  }
}
