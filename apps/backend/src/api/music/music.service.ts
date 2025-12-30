import { Injectable, NotFoundException } from "@nestjs/common";

import { Prisma } from "../../generated/prisma/client";

import { PrismaService } from "../../db/prisma.service";
import type { AlbumModel, ArtistModel, TrackModel } from "./music.model";
import type {
  SearchAlbumsInput,
  SearchArtistsInput,
  SearchMusicInput,
  SearchTracksInput,
} from "./dto/search-music.input";

@Injectable()
export class MusicService {
  constructor(private readonly prisma: PrismaService) {}

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
      },
    });

    if (!track) {
      throw new NotFoundException(`Track with id ${id} not found`);
    }

    return {
      id: track.id,
      name: track.name,
      isrc: track.isrc,
      date: track.date,
      durationMs: track.durationMs,
      albumId: track.albumId,
      discNumber: track.discNumber,
      trackNumber: track.trackNumber,
      artists: track.artists.map((ta) => ({
        id: ta.artist.id,
        name: ta.artist.name,
      })),
    };
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

    // Group tracks by disc number
    const tracksByDisc: TrackModel[][] = [];
    let currentDisc = -1;

    for (const track of album.tracks) {
      if (track.discNumber !== currentDisc) {
        currentDisc = track.discNumber;
        tracksByDisc[currentDisc - 1] = [];
      }

      tracksByDisc[currentDisc - 1].push({
        id: track.id,
        name: track.name,
        isrc: track.isrc,
        date: track.date,
        durationMs: track.durationMs,
        albumId: track.albumId,
        discNumber: track.discNumber,
        trackNumber: track.trackNumber,
        artists: track.artists.map((ta) => ({
          id: ta.artist.id,
          name: ta.artist.name,
        })),
      });
    }

    return {
      id: album.id,
      name: album.name,
      date: album.date,
      artists: album.artists.map((aa) => ({
        id: aa.artist.id,
        name: aa.artist.name,
      })),
      tracksByDisc,
    };
  }

  async getArtist(id: string): Promise<ArtistModel> {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException(`Artist with id ${id} not found`);
    }

    return {
      id: artist.id,
      name: artist.name,
    };
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
      },
      orderBy: [{ name: "asc" }],
      take: limit,
      skip: offset,
    });

    return tracks.map((track) => ({
      id: track.id,
      name: track.name,
      isrc: track.isrc,
      date: track.date,
      durationMs: track.durationMs,
      albumId: track.albumId,
      discNumber: track.discNumber,
      trackNumber: track.trackNumber,
      artists: track.artists.map((ta) => ({
        id: ta.artist.id,
        name: ta.artist.name,
      })),
    }));
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

    return albums.map((album) => {
      // Group tracks by disc number
      const tracksByDisc: TrackModel[][] = [];
      let currentDisc = -1;

      for (const track of album.tracks) {
        if (track.discNumber !== currentDisc) {
          currentDisc = track.discNumber;
          tracksByDisc[currentDisc - 1] = [];
        }

        tracksByDisc[currentDisc - 1].push({
          id: track.id,
          name: track.name,
          isrc: track.isrc,
          date: track.date,
          durationMs: track.durationMs,
          albumId: track.albumId,
          discNumber: track.discNumber,
          trackNumber: track.trackNumber,
          artists: track.artists.map((ta) => ({
            id: ta.artist.id,
            name: ta.artist.name,
          })),
        });
      }

      return {
        id: album.id,
        name: album.name,
        date: album.date,
        artists: album.artists.map((aa) => ({
          id: aa.artist.id,
          name: aa.artist.name,
        })),
        tracksByDisc,
      };
    });
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

    return artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
    }));
  }

  async searchMusic(input: SearchMusicInput): Promise<{
    tracks: TrackModel[];
    albums: AlbumModel[];
    artists: ArtistModel[];
  }> {
    const limit = input.limit ?? 50;
    const offset = input.offset ?? 0;

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

    // Execute queries in parallel
    const [tracks, albums, artists] = await Promise.all([
      this.prisma.track.findMany({
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
        },
        orderBy: [{ name: "asc" }],
        take: limit,
        skip: offset,
      }),
      this.prisma.album.findMany({
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
      }),
      this.prisma.artist.findMany({
        where: artistWhere,
        orderBy: [{ name: "asc" }],
        take: limit,
        skip: offset,
      }),
    ]);

    return {
      tracks: tracks.map((track) => ({
        id: track.id,
        name: track.name,
        isrc: track.isrc,
        date: track.date,
        durationMs: track.durationMs,
        albumId: track.albumId,
        discNumber: track.discNumber,
        trackNumber: track.trackNumber,
        artists: track.artists.map((ta) => ({
          id: ta.artist.id,
          name: ta.artist.name,
        })),
      })),
      albums: albums.map((album) => {
        // Group tracks by disc number
        const tracksByDisc: TrackModel[][] = [];
        let currentDisc = -1;

        for (const track of album.tracks) {
          if (track.discNumber !== currentDisc) {
            currentDisc = track.discNumber;
            tracksByDisc[currentDisc - 1] = [];
          }

          tracksByDisc[currentDisc - 1].push({
            id: track.id,
            name: track.name,
            isrc: track.isrc,
            date: track.date,
            durationMs: track.durationMs,
            albumId: track.albumId,
            discNumber: track.discNumber,
            trackNumber: track.trackNumber,
            artists: track.artists.map((ta) => ({
              id: ta.artist.id,
              name: ta.artist.name,
            })),
          });
        }

        return {
          id: album.id,
          name: album.name,
          date: album.date,
          artists: album.artists.map((aa) => ({
            id: aa.artist.id,
            name: aa.artist.name,
          })),
          tracksByDisc,
        };
      }),
      artists: artists.map((artist) => ({
        id: artist.id,
        name: artist.name,
      })),
    };
  }
}
