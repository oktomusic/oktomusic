import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreatePlaylistInput {
  @Field({ description: "Playlist name" })
  name!: string;

  @Field({ nullable: true, description: "Optional playlist description" })
  description?: string;

  @Field(() => Boolean, {
    nullable: true,
    defaultValue: false,
    description: "Whether the playlist is publicly visible",
  })
  isPublic?: boolean;
}
