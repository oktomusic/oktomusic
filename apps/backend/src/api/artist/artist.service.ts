import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../../db/prisma.service";
import type { SearchArtistsInput } from "./dto/search-artists.input";
import { ArtistModel } from "./artist.model";

@Injectable()
export class ArtistService {
  constructor(private readonly prisma: PrismaService) {}

  async getArtist(id: string): Promise<ArtistModel> {
    const artist = await this.prisma.artist.findUnique({ where: { id } });

    if (!artist) {
      throw new NotFoundException(`Artist with id ${id} not found`);
    }

    return { id: artist.id, name: artist.name };
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
