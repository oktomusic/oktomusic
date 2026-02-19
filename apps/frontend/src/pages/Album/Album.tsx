import { useRef } from "react";
import { useQuery } from "@apollo/client/react";
import { plural, t } from "@lingui/core/macro";
import { useSetAtom } from "jotai";
import { HiEllipsisHorizontal, HiOutlineShare, HiPlay } from "react-icons/hi2";
import { Link, useParams } from "react-router";

import { ALBUM_QUERY } from "../../api/graphql/queries/album";
import { DurationLong } from "../../components/DurationLong";
import { OktoMenu, OktoMenuItem } from "../../components/Base/OktoMenu";
import { TrackList } from "../../components/TrackList/TrackList";
import { formatDuration } from "../../utils/format_duration";
import {
  addToQueueAtom,
  replaceQueueAtom,
  VibrantColors,
} from "../../atoms/player/machine";
import { mapTracksWithAlbum } from "../../utils/album_tracks";
import { useVibrantColors } from "../../hooks/vibrant_colors";

import "./Album.css";

export function Album() {
  const { cuid } = useParams();

  const { data, loading, error } = useQuery(ALBUM_QUERY, {
    variables: { id: cuid! },
    skip: !cuid,
  });

  const mainDivRef = useRef<HTMLDivElement>(null);

  const albumColors: VibrantColors = {
    vibrant: data?.album.coverColorVibrant ?? "#ffffff",
    darkVibrant: data?.album.coverColorDarkVibrant ?? "#ffffff",
    lightVibrant: data?.album.coverColorLightVibrant ?? "#ffffff",
    muted: data?.album.coverColorMuted ?? "#ffffff",
    darkMuted: data?.album.coverColorDarkMuted ?? "#ffffff",
    lightMuted: data?.album.coverColorLightMuted ?? "#ffffff",
  };

  useVibrantColors(mainDivRef, albumColors);

  const replaceQueue = useSetAtom(replaceQueueAtom);
  const addToQueue = useSetAtom(addToQueueAtom);

  if (!cuid) {
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  // TODO: 404 if no album found
  // TODO: album colors

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const albumTracksTotal = data!.album.tracksByDisc.reduce(
    (acc, disc) => acc + disc.length,
    0,
  );
  const albumDurationMs = data!.album.tracksByDisc
    .flat()
    .reduce((acc, track) => acc + track.durationMs, 0);

  const albumHasMultipleDiscs = data!.album.tracksByDisc.length > 1;
  const tracksWithAlbum = mapTracksWithAlbum(data!.album);
  const flatTracks = tracksWithAlbum.flat();

  const menuItems: OktoMenuItem[] = [
    {
      type: "button",
      label: t`Share`,
      icon: <HiOutlineShare className="size-4" />,
      onClick: () => {
        if (!data) {
          return;
        }

        const albumUrl = `${window.location.origin}/album/${data.album.id}`;

        // TODO: handle promise failure + feedback to user
        if (navigator.share !== undefined) {
          void navigator.share({
            title: data.album.name,
            url: albumUrl,
          });
        } else {
          void navigator.clipboard.writeText(albumUrl);
        }
      },
    },
    {
      type: "button",
      label: t`Add to Queue`,
      onClick: () => {
        addToQueue(flatTracks);
      },
    },
  ];

  return (
    <div className="w-full" ref={mainDivRef}>
      <div className="album-banner flex h-80 w-full items-end p-6">
        <div className="flex flex-row gap-6">
          <img
            src={`/api/album/${data!.album.id}/cover/1280`}
            alt={data!.album.name}
            className="aspect-square h-full max-h-56 w-full max-w-56 rounded-lg shadow-2xl/50"
          />
          <div className="flex flex-col justify-end gap-2">
            <h2 className="text-7xl font-bold">{data!.album.name}</h2>
            <div className="text-sm">
              <span className="font-bold">
                {data!.album.artists.map((artist, index) => (
                  <span key={artist.id ?? index}>
                    <Link
                      to={`/artist/${artist.id}`}
                      className="hover:underline"
                    >
                      {artist.name}
                    </Link>
                    {index < (data!.album.artists.length ?? 0) - 1 && ", "}
                  </span>
                ))}
              </span>
              <span className="mx-2">•</span>
              <span title={data!.album.date?.toLocaleDateString() ?? ""}>
                {data!.album.date?.getFullYear()}
              </span>
              <span className="mx-2">•</span>
              <span>
                {plural(
                  { count: albumTracksTotal },
                  {
                    one: "# track",
                    other: "# tracks",
                  },
                )}
              </span>
              <span>, </span>
              <span>
                <DurationLong durationMs={albumDurationMs} />
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-6 py-4">
        <div className="flex flex-row gap-4">
          <button
            className="size-12 rounded-full bg-blue-500"
            title={t`Play`}
            onClick={() => replaceQueue(flatTracks)}
          >
            <HiPlay className="m-auto size-6" />
          </button>
          <OktoMenu
            button={<HiEllipsisHorizontal className="size-6" />}
            items={menuItems}
            anchor="bottom start"
          />
        </div>
        <TrackList tracks={tracksWithAlbum} />
        <div className="grid grid-cols-3">
          <div>#</div>
          <div>Title</div>
          <div className="">Duration</div>
        </div>
        <div className="flex flex-col gap-2">
          {data!.album.tracksByDisc.map((disc, discIndex) => (
            <div key={discIndex} className="flex flex-col gap-2">
              {albumHasMultipleDiscs && (
                <h3 className="text-sm font-bold">{`Disc ${discIndex + 1}`}</h3>
              )}
              <div className="flex flex-col">
                {disc.map((track, trackIndex) => (
                  <div
                    key={track.id}
                    className="flex h-14 flex-row items-center gap-4 rounded-lg p-2 hover:bg-white/10"
                  >
                    <span className="w-6 text-right text-sm text-white/50">
                      {trackIndex + 1}
                    </span>
                    <span>{track.name}</span>
                    <span className="ml-auto text-sm text-white/50">
                      {formatDuration(track.durationMs)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
