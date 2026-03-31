import { useQuery } from "@apollo/client/react";
import { useParams } from "react-router";
import { useSetAtom } from "jotai";
import { Temporal } from "temporal-polyfill";
import { t } from "@lingui/core/macro";
import { LuPen } from "react-icons/lu";

import { PLAYLIST_QUERY } from "../../api/graphql/queries/playlist";
import { GenericLoading } from "./GenericLoading";
import { GenericGraphQLError } from "./GenericGraphQLError";
import { CollectionView } from "../../components/CollectionView/CollectionView";
import { TrackList } from "../../components/TrackList/TrackList";
import coverPlaceHolder from "../../assets/pip-cover-placeholder.svg";
import type { TrackWithAlbum } from "../../atoms/player/machine";
import { dialogPlaylistOpenAtom } from "../../atoms/app/dialogs";

export function Playlist() {
  const { cuid } = useParams();

  const setDialogPlaylistOpen = useSetAtom(dialogPlaylistOpenAtom);

  const { data, loading, error } = useQuery(PLAYLIST_QUERY, {
    variables: { id: cuid! },
    skip: !cuid,
  });

  if (!cuid) {
    return null;
  }

  // TODO: handle loading as a placeholder skeleton instead of blocking the entire page with a spinner
  if (loading) {
    return <GenericLoading />;
  }

  if (error) {
    return <GenericGraphQLError error={error} />;
  }

  const playlist = data?.playlist;
  if (!playlist) {
    return null;
  }

  const playlistDurationMs = playlist.tracks.reduce(
    (acc, playlistTrack) => acc + playlistTrack.track.durationMs,
    0,
  );

  const playlistTracks = playlist.tracks
    .map((playlistTrack) => playlistTrack.track)
    .filter((track): track is TrackWithAlbum => track.album !== null);

  const primaryAlbum = playlistTracks[0]?.album;

  const playlistDate = primaryAlbum?.date
    ? Temporal.PlainDate.from(primaryAlbum.date.toISOString().slice(0, 10))
    : undefined;

  const playlistColors = primaryAlbum
    ? {
        vibrant: primaryAlbum.coverColorVibrant,
        darkVibrant: primaryAlbum.coverColorDarkVibrant,
        lightVibrant: primaryAlbum.coverColorLightVibrant,
        muted: primaryAlbum.coverColorMuted,
        darkMuted: primaryAlbum.coverColorDarkMuted,
        lightMuted: primaryAlbum.coverColorLightMuted,
      }
    : undefined;

  const playlistCover = primaryAlbum
    ? `/api/album/${primaryAlbum.id}/cover/1280`
    : coverPlaceHolder;

  const tracksByDisc: TrackWithAlbum[][] = [playlistTracks];

  const trackCount = playlist.tracks.length;

  const title = playlist.name;

  const creator = playlist.creator as {
    readonly id: string;
    readonly username: string;
  };

  return (
    <CollectionView
      type={t`Playlist`}
      title={title}
      subtitle={playlist.description ?? undefined}
      cover={playlistCover}
      colors={playlistColors}
      meta={{
        user: creator,
        date: playlistDate,
        tracksTotal: trackCount,
        durationMs: playlistDurationMs,
      }}
      visibility={playlist.visibility}
      actions={{
        menuItems: [
          {
            type: "button",
            label: t`Edit details`,
            icon: <LuPen className="size-4" />,
            onClick: () => {
              setDialogPlaylistOpen(cuid);
            },
          },
        ],
      }}
    >
      <TrackList tracks={tracksByDisc} displayCover={true} />
    </CollectionView>
  );
}
