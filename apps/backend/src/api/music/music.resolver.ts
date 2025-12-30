import { UseGuards } from "@nestjs/common";
import { Args, ObjectType, Field, Query, Resolver } from "@nestjs/graphql";

import { GraphqlAuthGuard } from "../../common/guards/graphql-auth.guard";
import { AlbumModel, ArtistModel, TrackModel } from "./music.model";
import { MusicService } from "./music.service";
import {
  SearchAlbumsInput,
  SearchArtistsInput,
  SearchMusicInput,
  SearchTracksInput,
} from "./dto/search-music.input";

@ObjectType()
export class SearchMusicResult {
  @Field(() => [TrackModel])
  tracks!: TrackModel[];

  @Field(() => [AlbumModel])
  albums!: AlbumModel[];

  @Field(() => [ArtistModel])
  artists!: ArtistModel[];
}

@Resolver()
export class MusicResolver {
  constructor(private readonly musicService: MusicService) {}

  @UseGuards(GraphqlAuthGuard)
  @Query(() => TrackModel, {
    name: "track",
    description: "Get a single track by ID",
  })
  async track(
    @Args("id", { type: () => String }) id: string,
  ): Promise<TrackModel> {
    return this.musicService.getTrack(id);
  }

  @UseGuards(GraphqlAuthGuard)
  @Query(() => AlbumModel, {
    name: "album",
    description: "Get a single album by ID with tracks grouped by disc number",
  })
  async album(
    @Args("id", { type: () => String }) id: string,
  ): Promise<AlbumModel> {
    return this.musicService.getAlbum(id);
  }

  @UseGuards(GraphqlAuthGuard)
  @Query(() => ArtistModel, {
    name: "artist",
    description: "Get a single artist by ID",
  })
  async artist(
    @Args("id", { type: () => String }) id: string,
  ): Promise<ArtistModel> {
    return this.musicService.getArtist(id);
  }

  @UseGuards(GraphqlAuthGuard)
  @Query(() => [TrackModel], {
    name: "searchTracks",
    description: "Search for tracks with optional filters",
  })
  async searchTracks(
    @Args("input", { type: () => SearchTracksInput }) input: SearchTracksInput,
  ): Promise<TrackModel[]> {
    return this.musicService.searchTracks(input);
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
    return this.musicService.searchAlbums(input);
  }

  @UseGuards(GraphqlAuthGuard)
  @Query(() => [ArtistModel], {
    name: "searchArtists",
    description: "Search for artists with optional filters",
  })
  async searchArtists(
    @Args("input", { type: () => SearchArtistsInput })
    input: SearchArtistsInput,
  ): Promise<ArtistModel[]> {
    return this.musicService.searchArtists(input);
  }

  @UseGuards(GraphqlAuthGuard)
  @Query(() => SearchMusicResult, {
    name: "search",
    description:
      "Search across tracks, albums, and artists with flexible filtering. Returns matching results for all entity types.",
  })
  async search(
    @Args("input", { type: () => SearchMusicInput }) input: SearchMusicInput,
  ): Promise<SearchMusicResult> {
    return this.musicService.searchMusic(input);
  }
}
