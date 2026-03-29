import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";

import { PlaylistVisibility } from "./playlist-visibility.enum";
import { TrackModel } from "../track/track.model";

@ObjectType("PlaylistCreator")
export class PlaylistCreatorModel {
  @Field()
  id!: string;

  @Field()
  username!: string;
}

@ObjectType("PlaylistTrack")
export class PlaylistTrackModel {
  @Field(() => Int, { description: "Position in the playlist (0-based)" })
  position!: number;

  @Field(() => GraphQLISODateTime, { description: "When the track was added" })
  addedAt!: Date;

  @Field(() => TrackModel)
  track!: TrackModel;
}

@ObjectType("Playlist")
export class PlaylistModel {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description!: string | null;

  @Field(() => PlaylistVisibility, {
    description: "Visibility level of the playlist",
  })
  visibility!: PlaylistVisibility;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;

  @Field(() => PlaylistCreatorModel)
  creator!: PlaylistCreatorModel;

  @Field(() => [PlaylistTrackModel])
  tracks!: PlaylistTrackModel[];
}

@ObjectType("PlaylistBasic")
export class PlaylistBasicModel {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description!: string | null;

  @Field(() => PlaylistVisibility, {
    description: "Visibility level of the playlist",
  })
  visibility!: PlaylistVisibility;

  @Field(() => PlaylistCreatorModel)
  creator!: PlaylistCreatorModel;
}
