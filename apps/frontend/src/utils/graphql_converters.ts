import {
  Playlist,
  PlaylistBasic,
  type Album,
  type AlbumBasic,
} from "../api/graphql/gql/graphql";

type AlbumToAlbumBasicInput = Pick<
  Album,
  | "artists"
  | "coverColorDarkMuted"
  | "coverColorDarkVibrant"
  | "coverColorLightMuted"
  | "coverColorLightVibrant"
  | "coverColorMuted"
  | "coverColorVibrant"
  | "date"
  | "id"
  | "name"
>;

export function albumToAlbumBasic(album: AlbumToAlbumBasicInput): AlbumBasic {
  return {
    __typename: "AlbumBasic",
    artists: album.artists,
    coverColorDarkMuted: album.coverColorDarkMuted,
    coverColorDarkVibrant: album.coverColorDarkVibrant,
    coverColorLightMuted: album.coverColorLightMuted,
    coverColorLightVibrant: album.coverColorLightVibrant,
    coverColorMuted: album.coverColorMuted,
    coverColorVibrant: album.coverColorVibrant,
    date: album.date,
    id: album.id,
    name: album.name,
  };
}

type PlaylistToPlaylistBasicInput = Pick<
  Playlist,
  "creator" | "description" | "id" | "name" | "visibility"
>;

export function playlistToPlaylistBasic(
  playlist: PlaylistToPlaylistBasicInput,
): PlaylistBasic {
  return {
    __typename: "PlaylistBasic",
    creator: playlist.creator,
    description: playlist.description,
    id: playlist.id,
    name: playlist.name,
    visibility: playlist.visibility,
  };
}
