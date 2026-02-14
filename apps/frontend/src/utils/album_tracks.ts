import type { AlbumBasic, AlbumQuery } from "../api/graphql/gql/graphql";
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
      albumId: album.id,
      album: albumBasic,
      date: null,
      isrc: null,
      lyrics: null,
    })),
  );
}
