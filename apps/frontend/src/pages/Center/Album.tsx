import { useQuery } from "@apollo/client/react";
import { t } from "@lingui/core/macro";
import { useSetAtom } from "jotai";
import { LuListPlus, LuShare } from "react-icons/lu";
import { useParams } from "react-router";
import { Temporal } from "temporal-polyfill";

import { ALBUM_QUERY } from "../../api/graphql/queries/album";
import { GenericGraphQLError } from "./GenericGraphQLError";
import { type OktoMenuItem } from "../../components/Base/OktoMenu";
import { CollectionView } from "../../components/CollectionView/CollectionView";
import { TrackList } from "../../components/TrackList/TrackList";
import { GenericLoading } from "./GenericLoading";
import {
  addToQueueAtom,
  replaceQueueAtom,
  type VibrantColorsPartial,
} from "../../atoms/player/machine";
import { dialogCoverId } from "../../atoms/app/dialogs";
import { mapTracksWithAlbum } from "../../utils/album_tracks";
import { useShare } from "../../hooks/use_share";
import { CollectionViewMetaAlbum } from "../../components/CollectionView/CollectionViewMetaAlbum";
import { CollectionViewToolbarAlbum } from "../../components/CollectionView/CollectionViewToolbarAlbum";

export function Album() {
  const { cuid } = useParams();

  const { data, loading, error } = useQuery(ALBUM_QUERY, {
    variables: { id: cuid! },
    skip: !cuid,
  });

  const albumColors: VibrantColorsPartial = {
    vibrant: data?.album.coverColorVibrant ?? "#ffffff",
    darkVibrant: data?.album.coverColorDarkVibrant ?? "#ffffff",
    lightVibrant: data?.album.coverColorLightVibrant ?? "#ffffff",
    muted: data?.album.coverColorMuted ?? "#ffffff",
    darkMuted: data?.album.coverColorDarkMuted ?? "#ffffff",
    lightMuted: data?.album.coverColorLightMuted ?? "#ffffff",
  };

  const replaceQueue = useSetAtom(replaceQueueAtom);
  const addToQueue = useSetAtom(addToQueueAtom);

  const setDialogCoverId = useSetAtom(dialogCoverId);

  const share = useShare(
    data ? `${window.location.origin}/album/${data.album.id}` : undefined,
    data?.album.name || undefined,
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

  const albumTracksTotal = data!.album.tracksByDisc.reduce(
    (acc, disc) => acc + disc.length,
    0,
  );
  const albumDurationMs = data!.album.tracksByDisc
    .flat()
    .reduce((acc, track) => acc + track.durationMs, 0);

  const tracksWithAlbum = mapTracksWithAlbum(data!.album);
  const flatTracks = tracksWithAlbum.flat();
  const albumDate = data!.album.date
    ? Temporal.PlainDate.from(data!.album.date.toISOString().slice(0, 10))
    : undefined;

  const menuItems: OktoMenuItem[] = [
    {
      type: "button",
      label: t`Share`,
      icon: <LuShare className="size-4" />,
      onClick: share,
    },
    {
      type: "button",
      icon: <LuListPlus className="size-4" />,
      label: t`Add to queue`,
      onClick: () => {
        addToQueue(flatTracks);
      },
    },
  ];

  return (
    <CollectionView
      type={t`Album`}
      title={data!.album.name}
      cover={`/api/album/${data!.album.id}/cover/1280`}
      coverOnClick={() => {
        setDialogCoverId(data!.album.id);
      }}
      onPlay={() => {
        replaceQueue(flatTracks);
      }}
      colors={albumColors}
      meta={
        <CollectionViewMetaAlbum
          artists={data!.album.artists}
          date={albumDate}
          tracksTotal={albumTracksTotal}
          durationMs={albumDurationMs}
        />
      }
      toolbar={
        <CollectionViewToolbarAlbum
          albumName={data!.album.name}
          menuItems={menuItems}
        />
      }
    >
      <TrackList
        tracks={tracksWithAlbum}
        displayCover={true} /* TODO: remove cover */
      />
    </CollectionView>
  );
}
