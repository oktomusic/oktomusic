import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { GraphQLISODateTime } from "@nestjs/graphql";

import { Role, Sex } from "../../generated/prisma/client";
import { PlaylistBasicModel } from "../playlist/playlist.model";

export const LibraryItemType = {
  ALBUM: "ALBUM",
  PLAYLIST: "PLAYLIST",
} as const;

export type LibraryItemType =
  (typeof LibraryItemType)[keyof typeof LibraryItemType];

registerEnumType(Role, { name: "Role" });
registerEnumType(Sex, { name: "Sex" });
registerEnumType(LibraryItemType, {
  name: "LibraryItemType",
});

@ObjectType("User")
export class UserModel {
  @Field()
  id!: string;

  @Field()
  username!: string;

  @Field()
  oidcSub!: string;

  @Field(() => Role)
  role!: Role;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;

  @Field(() => Sex, { nullable: true })
  sex!: Sex | null;

  @Field(() => [PlaylistBasicModel], {
    description: "Playlists visible to the connected user",
  })
  playlists?: PlaylistBasicModel[];
}
