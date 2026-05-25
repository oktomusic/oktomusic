import { ForbiddenException, UseGuards } from "@nestjs/common";
import {
  Args,
  Context,
  Field,
  ObjectType,
  Query,
  Resolver,
} from "@nestjs/graphql";
import type { Request } from "express";

import { GraphqlAuthGuard } from "../../common/guards/graphql-auth.guard";
import { AlbumModel } from "../album/album.model";
import { ArtistModel } from "../artist/artist.model";
import { PlaylistBasicModel } from "../playlist/playlist.model";
import { TrackModel } from "../track/track.model";
import { SearchMusicInput } from "./dto/search-music.input";
import { SearchService } from "./search.service";

@ObjectType()
export class SearchMusicResult {
  @Field(() => [TrackModel])
  tracks!: TrackModel[];

  @Field(() => [AlbumModel])
  albums!: AlbumModel[];

  @Field(() => [ArtistModel])
  artists!: ArtistModel[];

  @Field(() => [PlaylistBasicModel])
  playlists!: PlaylistBasicModel[];
}

@Resolver()
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}

  @UseGuards(GraphqlAuthGuard)
  @Query(() => SearchMusicResult, {
    name: "search",
    description:
      "Search across tracks, albums, artists, and playlists with flexible filtering. Returns matching results for all entity types. Note: limit applies to each entity type separately.",
  })
  async search(
    @Args("input", { type: () => SearchMusicInput }) input: SearchMusicInput,
    @Context("req") req: Request,
  ): Promise<SearchMusicResult> {
    if (!req.user) {
      throw new ForbiddenException("Current user not found in request");
    }

    return this.searchService.searchMusic(input);
  }
}
