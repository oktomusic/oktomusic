import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Button } from "@headlessui/react";
import { HiEllipsisHorizontal, HiPlay } from "react-icons/hi2";
import { LuCircleArrowDown, LuCirclePlus } from "react-icons/lu";
import { plural, t } from "@lingui/core/macro";
import { Temporal } from "temporal-polyfill";

import { DurationLong } from "../DurationLong";
import { OktoMenu, type OktoMenuItem } from "../Base/OktoMenu";

import { useVibrantColors } from "../../hooks/vibrant_colors";
import { useFitText } from "../../hooks/fit_text";
import {
  VibrantColors,
  VibrantColorsPartial,
} from "../../atoms/player/machine";

import "./CollectionView.css";

interface CollectionViewUser {
  readonly id: string;
  readonly username: string;
}

interface CollectionViewArtist {
  readonly id: string;
  readonly name: string;
}

/**
 * The small bits of informations about the collection, to be displayed below the title.
 */
interface CollectionViewMeta {
  readonly user?: CollectionViewUser;
  readonly artists?: readonly CollectionViewArtist[];
  readonly date?: Temporal.PlainDate;
  readonly tracksTotal?: number;
  readonly durationMs?: number;
}

interface CollectionViewActions {
  readonly onPlay?: () => void;
  readonly onSaveToLibrary?: () => void;
  readonly onDownload?: () => void;
  readonly menuItems?: readonly OktoMenuItem[];
}

interface CollectionViewProps {
  readonly type?: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly cover: string;
  readonly coverOnClick?: () => void;
  readonly meta: CollectionViewMeta;
  readonly colors?: VibrantColorsPartial;
  readonly actions?: CollectionViewActions;
  readonly children?: React.ReactNode;
}

/**
 * Used as a wrapper, provide the common header for artists, albums, playlists pages.
 *
 * Provide the cover, title, and color gradients.
 */
export function CollectionView(props: CollectionViewProps) {
  const menuItems = props.actions?.menuItems ?? [];
  const mainDivRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const titleContentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const actionButtonsRef = useRef<HTMLDivElement>(null);

  const [showStickyHeader, setShowStickyHeader] = useState(false);

  const albumColors: VibrantColors = {
    vibrant: props.colors?.vibrant ?? "#000000",
    darkVibrant: props.colors?.darkVibrant ?? "#000000",
    lightVibrant: props.colors?.lightVibrant ?? "#000000",
    muted: props.colors?.muted ?? "#000000",
    darkMuted: props.colors?.darkMuted ?? "#000000",
    lightMuted: props.colors?.lightMuted ?? "#000000",
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
  }, []);

  const albumName = props.title;

  return (
    <div className="collection-view" ref={mainDivRef}>
      {/* Sticky header */}
      <div className="collection-view__sticky-header sticky top-0 z-10 h-0">
        <div
          className={
            "collection-view__sticky-header__bar flex h-16 items-center gap-4 px-4 transition-opacity duration-200" +
            (showStickyHeader
              ? " opacity-100"
              : " pointer-events-none opacity-0")
          }
        >
          <Button
            className="size-12 shrink-0 rounded-full bg-blue-500"
            title={t`Play`}
            aria-label={t`Play ${albumName}`}
            onClick={props.actions?.onPlay}
          >
            <HiPlay className="m-auto size-6" />
          </Button>
          <h2 className="truncate text-2xl font-bold">{albumName}</h2>
        </div>
      </div>
      {/* Banner with cover, title and meta */}
      <div className="collection-view__banner w-full p-6">
        <div className="relative flex w-full flex-row gap-6">
          <img
            src={props.cover}
            alt={props.title}
            loading="eager"
            fetchPriority="high"
            draggable={false}
            className="aspect-square w-56 shrink-0 rounded-lg shadow-2xl/50 select-none hover:cursor-pointer"
            onClick={props.coverOnClick}
          />
          <div
            ref={titleContainerRef}
            className="absolute inset-y-0 right-0 left-62 flex flex-col justify-end overflow-hidden"
          >
            <div ref={titleContentRef} className="flex flex-col gap-2">
              <h2
                ref={titleRef}
                className="collection-view__banner__title font-bold"
              >
                {albumName}
              </h2>
              <div className="text-sm">
                {props.meta.user && (
                  <span className="font-bold">
                    <span key={props.meta.user.id}>
                      <Link
                        to={`/user/${props.meta.user.id}`}
                        className="hover:underline"
                      >
                        {props.meta.user.username}
                      </Link>
                    </span>
                  </span>
                )}

                {props.meta.artists && props.meta.artists.length > 0 && (
                  <>
                    {props.meta.user && <span className="mx-2">•</span>}
                    <span className="font-bold">
                      {props.meta.artists.map((artist, index) => (
                        <span key={artist.id ?? index}>
                          <Link
                            to={`/artist/${artist.id}`}
                            className="hover:underline"
                          >
                            {artist.name}
                          </Link>
                          {index < props.meta.artists!.length - 1 && ", "}
                        </span>
                      ))}
                    </span>
                  </>
                )}

                {props.meta.date && (
                  <>
                    {props.meta.artists && <span className="mx-2">•</span>}
                    <span title={props.meta.date.toLocaleString() ?? ""}>
                      {props.meta.date.year}
                    </span>
                  </>
                )}

                {props.meta.tracksTotal !== undefined && (
                  <>
                    <span className="mx-2">•</span>
                    <span>
                      {plural(
                        { count: props.meta.tracksTotal },
                        {
                          one: "# track",
                          other: "# tracks",
                        },
                      )}
                    </span>
                  </>
                )}

                {props.meta.durationMs !== undefined && (
                  <>
                    <span>, </span>
                    <DurationLong durationMs={props.meta.durationMs} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="collection-view__content flex flex-1 flex-col gap-4 px-6 py-4">
        <div
          ref={actionButtonsRef}
          className="flex flex-row items-center gap-4"
        >
          <Button
            className="size-12 rounded-full bg-blue-500"
            title={t`Play`}
            onClick={props.actions?.onPlay}
          >
            <HiPlay className="m-auto size-6" />
          </Button>
          <Button
            className="size-8"
            title={t`Save to library`}
            onClick={props.actions?.onSaveToLibrary}
          >
            <LuCirclePlus className="m-auto size-8" />
          </Button>
          <Button
            className="size-8"
            title={t`Download`}
            onClick={props.actions?.onDownload}
          >
            <LuCircleArrowDown className="m-auto size-8" />
          </Button>
          <OktoMenu
            button={<HiEllipsisHorizontal className="size-8" />}
            items={menuItems}
            anchor="bottom start"
            buttonAriaLabel={t`More options for ${albumName}`}
          />
        </div>
        {props.children}
      </div>
    </div>
  );
}
