import { Field, InputType } from "@nestjs/graphql";

import { PlaylistVisibility } from "../playlist-visibility.enum";

@InputType()
export class CreatePlaylistInput {
  @Field({
    nullable: true,
    description: "Target user ID (admin only, defaults to current user)",
  })
  userId?: string;

  @Field({ description: "Playlist name" })
  name!: string;

  @Field({ nullable: true, description: "Optional playlist description" })
  description?: string;

  @Field(() => PlaylistVisibility, {
    nullable: true,
    defaultValue: PlaylistVisibility.PRIVATE,
    description: "Visibility level of the playlist",
  })
  visibility?: PlaylistVisibility;
}
