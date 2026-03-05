import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";

import { GraphqlAuthGuard } from "../../common/guards/graphql-auth.guard";
import { AlbumModel } from "./album.model";
import { AlbumService } from "./album.service";
import { SearchAlbumsInput } from "./dto/search-albums.input";

@Resolver()
export class AlbumResolver {
  constructor(private readonly albumService: AlbumService) {}

  @UseGuards(GraphqlAuthGuard)
  @Query(() => AlbumModel, {
    name: "album",
    description: "Get a single album by ID with tracks grouped by disc number",
  })
  async album(
    @Args("id", { type: () => String }) id: string,
  ): Promise<AlbumModel> {
    return this.albumService.getAlbumGql(id);
  }

  @UseGuards(GraphqlAuthGuard)
  @Query(() => [AlbumModel], {
    name: "searchAlbums",
    description:
      "Search for albums with optional filters. Use this to get all albums by an artist.",
  })
  async searchAlbums(
    @Args("input", { type: () => SearchAlbumsInput }) input: SearchAlbumsInput,
  ): Promise<AlbumModel[]> {
    return this.albumService.searchAlbums(input);
  }
}
