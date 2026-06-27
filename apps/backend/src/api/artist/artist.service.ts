import { Injectable, NotFoundException } from "@nestjs/common";

import type { Prisma } from "../../generated/prisma/client";
import { PrismaService } from "../../db/prisma.service";
import { AlbumBasicModel } from "../album/album.model";
import type { SearchArtistsInput } from "./dto/search-artists.input";
import { ArtistModel } from "./artist.model";

const albumCardSelect = {
  id: true,
  name: true,
  date: true,
  coverColorVibrant: true,
  coverColorDarkVibrant: true,
  coverColorLightVibrant: true,
  coverColorMuted: true,
  coverColorDarkMuted: true,
  coverColorLightMuted: true,
  artists: {
    include: { artist: true },
    orderBy: { order: "asc" as const },
  },
} satisfies Prisma.AlbumSelect;

type AlbumCardPayload = Prisma.AlbumGetPayload<{
  select: typeof albumCardSelect;
}>;

@Injectable()
export class ArtistService {
  constructor(private readonly prisma: PrismaService) {}

  private buildAlbumBasicModel(album: AlbumCardPayload): AlbumBasicModel {
    return {
      id: album.id,
      name: album.name,
      date: album.date,
      artists: album.artists.map((albumArtist) => ({
        id: albumArtist.artist.id,
        name: albumArtist.artist.name,
      })),
      coverColorVibrant: album.coverColorVibrant,
      coverColorDarkVibrant: album.coverColorDarkVibrant,
      coverColorLightVibrant: album.coverColorLightVibrant,
      coverColorMuted: album.coverColorMuted,
      coverColorDarkMuted: album.coverColorDarkMuted,
      coverColorLightMuted: album.coverColorLightMuted,
    };
  }

  async getArtist(id: string): Promise<ArtistModel> {
    const artist = await this.prisma.artist.findUnique({ where: { id } });

    if (!artist) {
      throw new NotFoundException(`Artist with id ${id} not found`);
    }

    return { id: artist.id, name: artist.name };
  }

  async getAlbums(artistId: string): Promise<AlbumBasicModel[]> {
    const albums = await this.prisma.album.findMany({
      where: {
        artists: { some: { artistId } },
      },
      select: albumCardSelect,
      orderBy: [{ name: "asc" }],
    });

    return albums.map((album) => this.buildAlbumBasicModel(album));
  }

  async getFeaturedOnAlbums(artistId: string): Promise<AlbumBasicModel[]> {
    const albums = await this.prisma.album.findMany({
      where: {
        artists: { none: { artistId } },
        tracks: { some: { artists: { some: { artistId } } } },
      },
      select: albumCardSelect,
      orderBy: [{ name: "asc" }],
    });

    return albums.map((album) => this.buildAlbumBasicModel(album));
  }

  async searchArtists(input: SearchArtistsInput): Promise<ArtistModel[]> {
    const limit = input.limit ?? 50;
    const offset = input.offset ?? 0;

    const artists = await this.prisma.artist.findMany({
      where: {
        ...(input.name && {
          name: { contains: input.name, mode: "insensitive" },
        }),
      },
      orderBy: [{ name: "asc" }],
      take: limit,
      skip: offset,
    });

    return artists.map((a) => ({ id: a.id, name: a.name }));
  }
}
