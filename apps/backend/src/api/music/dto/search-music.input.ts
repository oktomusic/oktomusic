import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class SearchMusicInput {
  @Field({
    nullable: true,
    description: "Filter by track name (case-insensitive partial match)",
  })
  trackName?: string;

  @Field({
    nullable: true,
    description: "Filter by album name (case-insensitive partial match)",
  })
  albumName?: string;

  @Field({
    nullable: true,
    description: "Filter by artist name (case-insensitive partial match)",
  })
  artistName?: string;

  @Field({ nullable: true, description: "Filter by exact artist ID" })
  artistId?: string;

  @Field({ nullable: true, description: "Filter by exact album ID" })
  albumId?: string;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 50,
    description: "Maximum number of results to return",
  })
  limit?: number;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 0,
    description: "Number of results to skip",
  })
  offset?: number;

  @Field({
    nullable: true,
    defaultValue: true,
    description: "Include tracks in search results",
  })
  includeTracks?: boolean;

  @Field({
    nullable: true,
    defaultValue: true,
    description: "Include albums in search results",
  })
  includeAlbums?: boolean;

  @Field({
    nullable: true,
    defaultValue: true,
    description: "Include artists in search results",
  })
  includeArtists?: boolean;
}

@InputType()
export class SearchTracksInput {
  @Field({
    nullable: true,
    description: "Filter by track name (case-insensitive partial match)",
  })
  name?: string;

  @Field({ nullable: true, description: "Filter by artist ID" })
  artistId?: string;

  @Field({ nullable: true, description: "Filter by album ID" })
  albumId?: string;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 50,
    description: "Maximum number of results",
  })
  limit?: number;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 0,
    description: "Number of results to skip",
  })
  offset?: number;
}

@InputType()
export class SearchAlbumsInput {
  @Field({
    nullable: true,
    description: "Filter by album name (case-insensitive partial match)",
  })
  name?: string;

  @Field({ nullable: true, description: "Filter by artist ID" })
  artistId?: string;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 50,
    description: "Maximum number of results",
  })
  limit?: number;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 0,
    description: "Number of results to skip",
  })
  offset?: number;
}

@InputType()
export class SearchArtistsInput {
  @Field({
    nullable: true,
    description: "Filter by artist name (case-insensitive partial match)",
  })
  name?: string;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 50,
    description: "Maximum number of results",
  })
  limit?: number;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 0,
    description: "Number of results to skip",
  })
  offset?: number;
}
