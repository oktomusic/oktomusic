import {
  Field,
  GraphQLISODateTime,
  ObjectType,
  createUnionType,
  registerEnumType,
} from "@nestjs/graphql";

import { AlbumBasicModel } from "../album/album.model";
import { PlaylistBasicModel } from "../playlist/playlist.model";

export const LibraryItemType = {
  ALBUM: "ALBUM",
  PLAYLIST: "PLAYLIST",
} as const;

export type LibraryItemType =
  (typeof LibraryItemType)[keyof typeof LibraryItemType];

export const UserLibraryItemSource = {
  SAVED: "SAVED",
  OWNED_PLAYLIST: "OWNED_PLAYLIST",
} as const;

export type UserLibraryItemSource =
  (typeof UserLibraryItemSource)[keyof typeof UserLibraryItemSource];

registerEnumType(LibraryItemType, {
  name: "LibraryItemType",
});

registerEnumType(UserLibraryItemSource, {
  name: "UserLibraryItemSource",
});

export type LibraryItemModel = AlbumBasicModel | PlaylistBasicModel;

export const LibraryItemUnion = createUnionType({
  name: "LibraryItem",
  types: () => [AlbumBasicModel, PlaylistBasicModel] as const,
  resolveType(value: LibraryItemModel) {
    return "coverAlbumIds" in value ? PlaylistBasicModel : AlbumBasicModel;
  },
});

@ObjectType("UserLibraryEntry")
export class UserLibraryEntryModel {
  @Field()
  id!: string;

  @Field(() => LibraryItemType)
  itemType!: LibraryItemType;

  @Field()
  itemId!: string;

  @Field(() => UserLibraryItemSource)
  source!: UserLibraryItemSource;

  @Field(() => LibraryItemUnion)
  item!: LibraryItemModel;

  @Field(() => GraphQLISODateTime)
  addedAt!: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  lastPlayedAt!: Date | null;
}

@ObjectType("UserLibrary")
export class UserLibraryModel {
  @Field(() => [UserLibraryEntryModel])
  items!: UserLibraryEntryModel[];
}
