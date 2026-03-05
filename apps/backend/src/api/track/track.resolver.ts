import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";

import { GraphqlAuthGuard } from "../../common/guards/graphql-auth.guard";
import { SearchTracksInput } from "./dto/search-tracks.input";
import { TrackModel } from "./track.model";
import { TrackService } from "./track.service";

@Resolver()
export class TrackResolver {
  constructor(private readonly trackService: TrackService) {}

  @UseGuards(GraphqlAuthGuard)
  @Query(() => TrackModel, {
    name: "track",
    description: "Get a single track by ID",
  })
  async track(
    @Args("id", { type: () => String }) id: string,
  ): Promise<TrackModel> {
    return this.trackService.getTrack(id);
  }

  @UseGuards(GraphqlAuthGuard)
  @Query(() => [TrackModel], {
    name: "searchTracks",
    description: "Search for tracks with optional filters",
  })
  async searchTracks(
    @Args("input", { type: () => SearchTracksInput }) input: SearchTracksInput,
  ): Promise<TrackModel[]> {
    return this.trackService.searchTracks(input);
  }
}
