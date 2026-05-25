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

  @Field({
    nullable: true,
    description: "Filter by playlist name (case-insensitive partial match)",
  })
  playlistName?: string;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 50,
    description: "Maximum number of results to return",
  })
  limit?: number;

  @Field(() => Int, {
    nullable: true,
    description: "Maximum number of track results to return",
  })
  trackLimit?: number;

  @Field(() => Int, {
    nullable: true,
    description: "Maximum number of album results to return",
  })
  albumLimit?: number;

  @Field(() => Int, {
    nullable: true,
    description: "Maximum number of artist results to return",
  })
  artistLimit?: number;

  @Field(() => Int, {
    nullable: true,
    description: "Maximum number of playlist results to return",
  })
  playlistLimit?: number;

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

  @Field({
    nullable: true,
    defaultValue: true,
    description: "Include playlists in search results",
  })
  includePlaylists?: boolean;
}
