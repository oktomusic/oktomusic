import { useEffect, useRef, useState } from "react";
import { Button } from "@headlessui/react";
import { HiPause, HiPlay } from "react-icons/hi2";
import { t } from "@lingui/core/macro";

import { useVibrantColors } from "../../hooks/vibrant_colors";
import { useFitText } from "../../hooks/fit_text";
import {
  VibrantColors,
  VibrantColorsPartial,
} from "../../atoms/player/machine";

import "./CollectionView.css";

interface CollectionViewProps {
  readonly type?: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly cover: string;
  readonly coverOnClick?: () => void;
  readonly onPlay?: () => void;
  readonly playButtonIsPlaying?: boolean;
  readonly colors?: VibrantColorsPartial;
  /**
   * The small bits of informations about the collection, to be displayed below the subtitle.
   */
  readonly meta?: React.ReactNode;
  readonly toolbar?: React.ReactNode;
  readonly children?: React.ReactNode;
}

/**
 * Used as a wrapper, provide the common header for artists, albums, playlists pages.
 *
 * Provide the cover, title, and color gradients.
 */
export function CollectionView(props: CollectionViewProps) {
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
  const playButtonTitle = props.playButtonIsPlaying ? t`Pause` : t`Play`;
  const playButtonAriaLabel = props.playButtonIsPlaying
    ? t`Pause ${albumName}`
    : t`Play ${albumName}`;

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
          {props.onPlay && (
            <Button
              className="size-12 shrink-0 rounded-full bg-blue-500"
              title={playButtonTitle}
              aria-label={playButtonAriaLabel}
              onClick={props.onPlay}
            >
              {props.playButtonIsPlaying ? (
                <HiPause className="m-auto size-6" />
              ) : (
                <HiPlay className="m-auto size-6" />
              )}
            </Button>
          )}
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
              <span className="">{props.type}</span>
              <h2
                ref={titleRef}
                className="collection-view__banner__title font-bold"
              >
                {albumName}
              </h2>
              <div className="">{props.subtitle}</div>
              {props.meta}
            </div>
          </div>
        </div>
      </div>
      <div className="collection-view__content flex flex-1 flex-col gap-4 px-6 py-4">
        <div
          ref={actionButtonsRef}
          className="flex flex-row items-center gap-4"
        >
          {props.onPlay && (
            <Button
              className="size-12 rounded-full bg-blue-500"
              title={playButtonTitle}
              aria-label={playButtonAriaLabel}
              onClick={props.onPlay}
            >
              {props.playButtonIsPlaying ? (
                <HiPause className="m-auto size-6" />
              ) : (
                <HiPlay className="m-auto size-6" />
              )}
            </Button>
          )}
          {props.toolbar}
        </div>
        {props.children}
      </div>
    </div>
  );
}
