import { useQuery } from "@apollo/client/react";
import { useParams } from "react-router";
import { useSetAtom } from "jotai";
import { t } from "@lingui/core/macro";
import { LuListPlus, LuPen, LuShare } from "react-icons/lu";

import { PLAYLIST_QUERY } from "../../api/graphql/queries/playlist";
import { GenericLoading } from "./GenericLoading";
import { GenericGraphQLError } from "./GenericGraphQLError";
import { CollectionView } from "../../components/CollectionView/CollectionView";
import { TrackList } from "../../components/TrackList/TrackList";
import coverPlaceHolder from "../../assets/pip-cover-placeholder.svg";
import {
  addToQueueAtom,
  replaceQueueAtom,
  type TrackWithAlbum,
} from "../../atoms/player/machine";
import { dialogPlaylistOpenAtom } from "../../atoms/app/dialogs";
import { useShare } from "../../hooks/use_share";
import { CollectionViewMetaPlaylist } from "../../components/CollectionView/CollectionViewMetaPlaylist";

export function Playlist() {
  const { cuid } = useParams();

  const setDialogPlaylistOpen = useSetAtom(dialogPlaylistOpenAtom);

  const { data, loading, error } = useQuery(PLAYLIST_QUERY, {
    variables: { id: cuid! },
    skip: !cuid,
  });

  const replaceQueue = useSetAtom(replaceQueueAtom);
  const addToQueue = useSetAtom(addToQueueAtom);

  const share = useShare(
    data ? `${window.location.origin}/playlist/${data.playlist.id}` : undefined,
    data?.playlist.name || undefined,
  );

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

  return (
    <CollectionView
      type={t`Playlist`}
      title={title}
      subtitle={playlist.description ?? undefined}
      cover={playlistCover}
      colors={playlistColors}
      meta={
        <CollectionViewMetaPlaylist
          visibility={playlist.visibility}
          user={playlist.creator}
          tracksTotal={trackCount}
          durationMs={playlistDurationMs}
        />
      }
      actions={{
        onPlay() {
          replaceQueue(playlistTracks);
        },
        menuItems: [
          {
            type: "button",
            label: t`Edit details`,
            icon: <LuPen className="size-4" />,
            onClick: () => {
              setDialogPlaylistOpen(cuid);
            },
          },
          {
            type: "button",
            icon: <LuListPlus className="size-4" />,
            label: t`Add to queue`,
            onClick: () => {
              addToQueue(playlistTracks);
            },
          },
          {
            type: "button",
            label: t`Share`,
            icon: <LuShare className="size-4" />,
            onClick: share,
          },
        ],
      }}
    >
      <TrackList
        tracks={tracksByDisc}
        displayCover={true}
        playlistId={playlist.id}
      />
    </CollectionView>
  );
}
