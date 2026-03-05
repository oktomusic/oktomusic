import { Field, ObjectType, GraphQLISODateTime } from "@nestjs/graphql";

import { ArtistModel } from "../artist/artist.model";
import { TrackModel } from "../track/track.model";

@ObjectType("AlbumBasic")
export class AlbumBasicModel {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  date!: Date | null;

  @Field(() => [ArtistModel])
  artists!: ArtistModel[];

  @Field({ description: "Vibrant color from cover art (hex string)" })
  coverColorVibrant!: string;

  @Field({ description: "Dark vibrant color from cover art (hex string)" })
  coverColorDarkVibrant!: string;

  @Field({ description: "Light vibrant color from cover art (hex string)" })
  coverColorLightVibrant!: string;

  @Field({ description: "Muted color from cover art (hex string)" })
  coverColorMuted!: string;

  @Field({ description: "Dark muted color from cover art (hex string)" })
  coverColorDarkMuted!: string;

  @Field({ description: "Light muted color from cover art (hex string)" })
  coverColorLightMuted!: string;
}

@ObjectType("Album")
export class AlbumModel {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  date!: Date | null;

  @Field(() => [ArtistModel])
  artists!: ArtistModel[];

  @Field({ description: "Vibrant color from cover art (hex string)" })
  coverColorVibrant!: string;

  @Field({ description: "Dark vibrant color from cover art (hex string)" })
  coverColorDarkVibrant!: string;

  @Field({ description: "Light vibrant color from cover art (hex string)" })
  coverColorLightVibrant!: string;

  @Field({ description: "Muted color from cover art (hex string)" })
  coverColorMuted!: string;

  @Field({ description: "Dark muted color from cover art (hex string)" })
  coverColorDarkMuted!: string;

  @Field({ description: "Light muted color from cover art (hex string)" })
  coverColorLightMuted!: string;

  @Field(() => [[TrackModel]], {
    description: "Tracks grouped by disc number, ordered by track number",
  })
  tracksByDisc!: TrackModel[][];
}
