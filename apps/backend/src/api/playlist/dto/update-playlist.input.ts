import { Field, InputType } from "@nestjs/graphql";

import { PlaylistVisibility } from "../playlist-visibility.enum";

@InputType()
export class UpdatePlaylistInput {
  @Field({ nullable: true, description: "Playlist name" })
  name?: string;

  @Field({
    nullable: true,
    description: "Optional playlist description, or null to clear",
  })
  description?: string | null;

  @Field(() => PlaylistVisibility, {
    nullable: true,
    description: "Visibility level of the playlist",
  })
  visibility?: PlaylistVisibility;
}
