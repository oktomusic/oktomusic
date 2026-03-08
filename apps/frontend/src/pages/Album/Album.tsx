import { useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { plural, t } from "@lingui/core/macro";
import { useSetAtom } from "jotai";
import { Button } from "@headlessui/react";
import { HiEllipsisHorizontal, HiOutlineShare, HiPlay } from "react-icons/hi2";
import { LuCircleArrowDown, LuCirclePlus, LuListPlus } from "react-icons/lu";
import { Link, useParams } from "react-router";

import { ALBUM_QUERY } from "../../api/graphql/queries/album";
import { DurationLong } from "../../components/DurationLong";
import { GenericGraphQLError } from "../Center/GenericGraphQLError";
import { OktoMenu, OktoMenuItem } from "../../components/Base/OktoMenu";
import { TrackList } from "../../components/TrackList/TrackList";
import { GenericLoading } from "../Center/GenericLoading";
import {
  addToQueueAtom,
  replaceQueueAtom,
  VibrantColors,
} from "../../atoms/player/machine";
import { panelToastAtom } from "../../atoms/app/panels";
import { dialogCoverId } from "../../atoms/app/dialogs";
import { mapTracksWithAlbum } from "../../utils/album_tracks";
import { useFitText } from "../../hooks/fit_text";
import { useVibrantColors } from "../../hooks/vibrant_colors";

import "./Album.css";

export function Album() {
  const { cuid } = useParams();

  const { data, loading, error } = useQuery(ALBUM_QUERY, {
    variables: { id: cuid! },
    skip: !cuid,
  });

  const mainDivRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const titleContentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const actionButtonsRef = useRef<HTMLDivElement>(null);

  const [showStickyHeader, setShowStickyHeader] = useState(false);

  const albumColors: VibrantColors = {
    vibrant: data?.album.coverColorVibrant ?? "#ffffff",
    darkVibrant: data?.album.coverColorDarkVibrant ?? "#ffffff",
    lightVibrant: data?.album.coverColorLightVibrant ?? "#ffffff",
    muted: data?.album.coverColorMuted ?? "#ffffff",
    darkMuted: data?.album.coverColorDarkMuted ?? "#ffffff",
    lightMuted: data?.album.coverColorLightMuted ?? "#ffffff",
  };

  useVibrantColors(mainDivRef, albumColors);
  useFitText(titleContainerRef, titleContentRef, titleRef);

  useEffect(() => {
    const sentinel = actionButtonsRef.current;
    if (!sentinel) {
      return undefined;
    }

    const scrollContainer = document.getElementById("oktomusic:panel-center");

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyHeader(!entry.isIntersecting);
      },
      {
        root: scrollContainer,
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [data]);

  const replaceQueue = useSetAtom(replaceQueueAtom);
  const addToQueue = useSetAtom(addToQueueAtom);

  const setToast = useSetAtom(panelToastAtom);

  const setDialogCoverId = useSetAtom(dialogCoverId);

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
        if (navigator.share && typeof navigator.share === "function") {
          void navigator.share({
            title: data.album.name,
            url: albumUrl,
          });
        } else {
          void navigator.clipboard.writeText(albumUrl);
          setToast({
            type: "success",
            message: t`Link copied to clipboard`,
          });
        }
      },
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

  const albumName = data!.album.name;

  return (
    <div className="flex min-h-full w-full flex-col" ref={mainDivRef}>
      <div className="album-sticky-header sticky top-0 z-10 h-0">
        <div
          className={
            "album-sticky-header__bar flex h-16 items-center gap-4 px-4 transition-opacity duration-200" +
            (showStickyHeader
              ? " opacity-100"
              : " pointer-events-none opacity-0")
          }
        >
          <Button
            className="size-12 shrink-0 rounded-full bg-blue-500"
            title={t`Play`}
            aria-label={t`Play ${albumName}`}
            onClick={() => replaceQueue(flatTracks)}
          >
            <HiPlay className="m-auto size-6" />
          </Button>
          <h2 className="truncate text-2xl font-bold">{albumName}</h2>
        </div>
      </div>
      <div className="album-banner w-full p-6">
        <div className="relative flex w-full flex-row gap-6">
          <img
            src={`/api/album/${data!.album.id}/cover/1280`}
            alt={data!.album.name}
            loading="eager"
            fetchPriority="high"
            draggable={false}
            className="aspect-square w-56 shrink-0 rounded-lg shadow-2xl/50 select-none hover:cursor-pointer"
            onClick={() => {
              setDialogCoverId(data!.album.id);
            }}
          />
          <div
            ref={titleContainerRef}
            className="absolute inset-y-0 right-0 left-62 flex flex-col justify-end overflow-hidden"
          >
            <div ref={titleContentRef} className="flex flex-col gap-2">
              <h2
                ref={titleRef}
                className="album-banner__title w-full font-bold"
              >
                {data!.album.name}
              </h2>
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
                      {index < data!.album.artists.length - 1 && ", "}
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
      </div>
      <div className="album-content flex flex-1 flex-col gap-4 px-6 py-4">
        <div
          ref={actionButtonsRef}
          className="flex flex-row items-center gap-4"
        >
          <Button
            className="size-12 rounded-full bg-blue-500"
            title={t`Play`}
            onClick={() => replaceQueue(flatTracks)}
          >
            <HiPlay className="m-auto size-6" />
          </Button>
          <Button
            className="size-8"
            title={t`Save to library`}
            onClick={undefined}
          >
            <LuCirclePlus className="m-auto size-8" />
          </Button>
          <Button className="size-8" title={t`Download`} onClick={undefined}>
            <LuCircleArrowDown className="m-auto size-8" />
          </Button>
          <OktoMenu
            button={<HiEllipsisHorizontal className="size-8" />}
            items={menuItems}
            anchor="bottom start"
            buttonAriaLabel={t`More options for ${albumName}`}
          />
        </div>
        <TrackList
          tracks={tracksWithAlbum}
          displayCover={true} /* TODO: remove cover */
        />
      </div>
    </div>
  );
}
