import { Field, Int, ObjectType } from "@nestjs/graphql";
import { GraphQLISODateTime } from "@nestjs/graphql";

@ObjectType("Artist")
export class ArtistModel {
  @Field()
  id!: string;

  @Field()
  name!: string;
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

  @Field(() => [[TrackModel]], {
    description: "Tracks grouped by disc number, ordered by track number",
  })
  tracksByDisc!: TrackModel[][];
}

@ObjectType("Track")
export class TrackModel {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  isrc!: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  date!: Date | null;

  @Field(() => Int, { description: "Duration in milliseconds" })
  durationMs!: number;

  @Field(() => [ArtistModel])
  artists!: ArtistModel[];

  @Field({ nullable: true })
  albumId!: string | null;

  @Field(() => Int)
  discNumber!: number;

  @Field(() => Int)
  trackNumber!: number;
}
