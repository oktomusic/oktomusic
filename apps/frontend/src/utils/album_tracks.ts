import type { AlbumQuery } from "../api/graphql/gql/graphql";
import type { AlbumBasic } from "../api/graphql/types";
import type { TrackWithAlbum } from "../atoms/player/machine";

export function mapTracksWithAlbum(
  album: AlbumQuery["album"],
): TrackWithAlbum[][] {
  const albumBasic: AlbumBasic = {
    __typename: "AlbumBasic",
    id: album.id,
    name: album.name,
    date: album.date,
    artists: album.artists,
    coverColorVibrant: album.coverColorVibrant,
    coverColorDarkVibrant: album.coverColorDarkVibrant,
    coverColorLightVibrant: album.coverColorLightVibrant,
    coverColorMuted: album.coverColorMuted,
    coverColorDarkMuted: album.coverColorDarkMuted,
    coverColorLightMuted: album.coverColorLightMuted,
  };

  return album.tracksByDisc.map((disc) =>
    disc.map((track) => ({
      ...track,
      album: albumBasic,
    })),
  );
}
