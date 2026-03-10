import { registerEnumType } from "@nestjs/graphql";

export enum PlaylistVisibility {
  PUBLIC = "PUBLIC",
  UNLISTED = "UNLISTED",
  PRIVATE = "PRIVATE",
}

registerEnumType(PlaylistVisibility, {
  name: "PlaylistVisibility",
  description: "Visibility level of a playlist",
});
