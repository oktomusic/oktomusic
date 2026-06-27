import { UseGuards } from "@nestjs/common";
import { Args, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";

import { GraphqlAuthGuard } from "../../common/guards/graphql-auth.guard";
import { AlbumBasicModel } from "../album/album.model";
import { ArtistDetailModel } from "./artist-detail.model";
import { ArtistModel } from "./artist.model";
import { ArtistService } from "./artist.service";
import { SearchArtistsInput } from "./dto/search-artists.input";

@Resolver(() => ArtistDetailModel)
export class ArtistResolver {
  constructor(private readonly artistService: ArtistService) {}

  @UseGuards(GraphqlAuthGuard)
  @ResolveField(() => [AlbumBasicModel], {
    name: "albums",
    description: "Albums where this artist is credited as an album artist",
  })
  async albums(@Parent() artist: ArtistModel): Promise<AlbumBasicModel[]> {
    return this.artistService.getAlbums(artist.id);
  }

  @UseGuards(GraphqlAuthGuard)
  @ResolveField(() => [AlbumBasicModel], {
    name: "featuredOnAlbums",
    description:
      "Albums where this artist is credited on tracks but not as an album artist",
  })
  async featuredOnAlbums(
    @Parent() artist: ArtistModel,
  ): Promise<AlbumBasicModel[]> {
    return this.artistService.getFeaturedOnAlbums(artist.id);
  }

  @UseGuards(GraphqlAuthGuard)
  @Query(() => ArtistDetailModel, {
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
