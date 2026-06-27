import { Field, ObjectType } from "@nestjs/graphql";

import { AlbumBasicModel } from "../album/album.model";
import { ArtistModel } from "./artist.model";

@ObjectType("ArtistDetail")
export class ArtistDetailModel extends ArtistModel {
  @Field(() => [AlbumBasicModel], {
    description: "Albums where this artist is credited as an album artist",
  })
  albums!: AlbumBasicModel[];

  @Field(() => [AlbumBasicModel], {
    description:
      "Albums where this artist is credited on tracks but not as an album artist",
  })
  featuredOnAlbums!: AlbumBasicModel[];
}
