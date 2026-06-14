import { ForbiddenException, UseGuards } from "@nestjs/common";
import {
  Args,
  Context,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import type { Request } from "express";

import { GraphqlAuthGuard } from "../../common/guards/graphql-auth.guard";
import { LibraryItemType } from "../library/library.model";
import { LibraryService } from "../library/library.service";
import { AlbumModel } from "./album.model";
import { AlbumService } from "./album.service";
import { SearchAlbumsInput } from "./dto/search-albums.input";

@Resolver(() => AlbumModel)
export class AlbumResolver {
  constructor(
    private readonly albumService: AlbumService,
    private readonly libraryService: LibraryService,
  ) {}

  @UseGuards(GraphqlAuthGuard)
  @ResolveField(() => Boolean, {
    name: "isInLibrary",
    description: "Whether the album is in the current user's library",
  })
  async isInLibrary(
    @Parent() album: AlbumModel,
    @Context("req") req: Request,
  ): Promise<boolean> {
    if (!req.user) {
      throw new ForbiddenException("Current user not found in request");
    }

    return this.libraryService.isInLibrary(req.user, {
      itemType: LibraryItemType.ALBUM,
      itemId: album.id,
    });
  }

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
