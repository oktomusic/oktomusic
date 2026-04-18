import { useQuery } from "@apollo/client/react";
import { useParams } from "react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { t } from "@lingui/core/macro";
import { LuCircleMinus, LuListPlus, LuPen, LuShare } from "react-icons/lu";

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
import {
  dialogCoverId,
  dialogPlaylistDeleteOpenAtom,
  dialogPlaylistOpenAtom,
} from "../../atoms/app/dialogs";
import { useShare } from "../../hooks/use_share";
import { CollectionViewMetaPlaylist } from "../../components/CollectionView/CollectionViewMetaPlaylist";
import { CollectionViewToolbarPlaylist } from "../../components/CollectionView/CollectionViewToolbarPlaylist";
import { OktoMenuItem } from "../../components/Base/OktoMenu";
import { authSessionAtom } from "../../atoms/auth/atoms";
import { Role } from "../../api/graphql/gql/graphql";

export function Playlist() {
  const { cuid } = useParams();

  const user = useAtomValue(authSessionAtom);
  const userId = user.status === "authenticated" ? user.user.id : null;
  const userIsAdmin =
    user.status === "authenticated" && user.user.role === Role.Admin;

  const setDialogPlaylistOpen = useSetAtom(dialogPlaylistOpenAtom);
  const setDialogPlaylistDeleteOpen = useSetAtom(dialogPlaylistDeleteOpenAtom);

  const { data, loading, error } = useQuery(PLAYLIST_QUERY, {
    variables: { id: cuid! },
    skip: !cuid,
  });

  const replaceQueue = useSetAtom(replaceQueueAtom);
  const addToQueue = useSetAtom(addToQueueAtom);

  const setDialogCoverId = useSetAtom(dialogCoverId);

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
  const playlistCoverId = primaryAlbum ? primaryAlbum.id : null;

  const tracksByDisc: TrackWithAlbum[][] = [playlistTracks];

  const trackCount = playlist.tracks.length;

  const title = playlist.name;

  const menuItems = [
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
    ...(userId === playlist.creator.id || userIsAdmin
      ? ([
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
            label: t`Delete playlist`,
            icon: <LuCircleMinus className="size-4" />,
            onClick: () => {
              setDialogPlaylistDeleteOpen({
                __typename: "PlaylistBasic",
                id: data.playlist.id,
                name: data.playlist.name,
                description: data.playlist.description,
                visibility: data.playlist.visibility,
                creator: data.playlist.creator,
              });
            },
          },
        ] as const satisfies readonly OktoMenuItem[])
      : []),
  ] as const satisfies readonly OktoMenuItem[];

  return (
    <CollectionView
      type={t`Playlist`}
      title={title}
      subtitle={playlist.description ?? undefined}
      cover={playlistCover}
      coverOnClick={() => {
        setDialogCoverId(playlistCoverId);
      }}
      colors={playlistColors}
      onPlay={() => {
        replaceQueue(playlistTracks);
      }}
      meta={
        <CollectionViewMetaPlaylist
          visibility={playlist.visibility}
          user={playlist.creator}
          tracksTotal={trackCount}
          durationMs={playlistDurationMs}
        />
      }
      toolbar={
        <CollectionViewToolbarPlaylist
          playlistName={title}
          menuItems={menuItems}
        />
      }
    >
      <TrackList
        tracks={tracksByDisc}
        displayCover={true}
        playlistId={playlist.id}
      />
    </CollectionView>
  );
}
