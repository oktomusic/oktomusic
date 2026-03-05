import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";

import { GraphqlAuthGuard } from "../../common/guards/graphql-auth.guard";
import { ArtistModel } from "./artist.model";
import { ArtistService } from "./artist.service";
import { SearchArtistsInput } from "./dto/search-artists.input";

@Resolver()
export class ArtistResolver {
  constructor(private readonly artistService: ArtistService) {}

  @UseGuards(GraphqlAuthGuard)
  @Query(() => ArtistModel, {
    name: "artist",
    description: "Get a single artist by ID",
  })
  async artist(
    @Args("id", { type: () => String }) id: string,
  ): Promise<ArtistModel> {
    return this.artistService.getArtist(id);
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
    return this.artistService.searchArtists(input);
  }
}
