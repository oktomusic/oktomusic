import { Field, Int, ObjectType } from "@nestjs/graphql";
import { GraphQLISODateTime } from "@nestjs/graphql";

@ObjectType("LyricsChunk")
export class LyricsChunkModel {
  @Field({ description: "Word or character" })
  c!: string;

  @Field(() => Int, {
    description: "Duration in milliseconds since the start of the line",
  })
  d!: number;
}

@ObjectType("LyricsLine")
export class LyricsLineModel {
  @Field(() => Int, { description: "Timestamp start in milliseconds" })
  ts!: number;

  @Field(() => Int, { description: "Timestamp end in milliseconds" })
  te!: number;

  @Field(() => [LyricsChunkModel], {
    description: "Tokenized line content (word/character + duration)",
  })
  l!: LyricsChunkModel[];

  @Field({ description: "Full text of the line" })
  t!: string;
}

@ObjectType("Artist")
export class ArtistModel {
  @Field()
  id!: string;

  @Field()
  name!: string;
}

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

  @Field(() => AlbumBasicModel, {
    nullable: true,
    description: "Album metadata",
  })
  album!: AlbumBasicModel | null;

  @Field(() => Int)
  discNumber!: number;

  @Field(() => Int)
  trackNumber!: number;

  @Field({
    nullable: true,
    description: "Linked FLAC file id if present",
  })
  flacFileId!: string | null;

  @Field(() => Boolean, {
    description: "Whether the track has lyrics indexed",
  })
  hasLyrics!: boolean;

  @Field(() => [LyricsLineModel], {
    nullable: true,
    description: "Optional lyrics data associated with the track",
  })
  lyrics!: LyricsLineModel[] | null;
}
