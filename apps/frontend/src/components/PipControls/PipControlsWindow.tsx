import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { t } from "@lingui/core/macro";
import { HiBackward, HiForward, HiPause, HiPlay } from "react-icons/hi2";

import {
  handleNextTrackAtom,
  handlePreviousTrackAtom,
  playerIsPlayingAtom,
  playerQueueCurrentTrack,
  requestPlaybackToggleAtom,
} from "../../atoms/player/machine";
import coverPlaceHolder from "../../assets/pip-cover-placeholder.svg";

const albumCoverColors = {
  vibrant: "#9e4433",
  darkVibrant: "#563614",
  lightVibrant: "#e4b594",
  muted: "#a06552",
  darkMuted: "#5e3c2d",
  lightMuted: "#d3c4b3",
} as const;

/**
 * The PiP controls window component.
 *
 * The window has three layouts depending on the available *window height*.
 * The grid + breakpoints are implemented in `PipControls.css` (see `#pip-shell > #pip-shell-inner`).
 */
export default function PipControlsWindow() {
  const figureRef = useRef<HTMLElement | null>(null);

  const currentTrack = useAtomValue(playerQueueCurrentTrack);
  const isPlaying = useAtomValue(playerIsPlayingAtom);
  const togglePlayback = useSetAtom(requestPlaybackToggleAtom);
  const handlePreviousTrack = useSetAtom(handlePreviousTrackAtom);
  const handleNextTrack = useSetAtom(handleNextTrackAtom);

  useEffect(() => {
    if (!figureRef.current) {
      return;
    }

    const coverEl = figureRef.current;

    // Set CSS variables for cover colors
    coverEl.style.setProperty(
      "--pip-cover-light-color",
      albumCoverColors.muted,
    );
    coverEl.style.setProperty(
      "--pip-cover-dark-color",
      albumCoverColors.darkMuted,
    );
  }, []);

  return (
    // Shell content mounted into the Document PiP window container (`#pip-shell`).
    // This element is the main responsive grid; see breakpoints in `PipControls.css`.
    <div id="pip-shell-inner">
      {/* Album cover region (also hosts CSS vars for cover-based gradients). */}
      <figure id="pip-cover" ref={figureRef}>
        <img
          className="pip-cover-image"
          src={
            currentTrack
              ? `/api/album/${currentTrack.album.id}/cover/1280`
              : coverPlaceHolder
          }
          draggable={false}
          alt={currentTrack ? "Album Cover" : t`No track playing`}
        />
        {currentTrack ? null : (
          <div className="pip-cover-overlay">{t`No track playing`}</div>
        )}
      </figure>

      {/* Track metadata region (title + artists; both lines truncate). */}
      <div id="pip-meta">
        {currentTrack ? (
          <>
            <a href={`/album/${currentTrack.album.id}`}>{currentTrack?.name}</a>
            <div id="pip-artists">
              {currentTrack.artists.map((artist) => artist.name).join(", ")}
            </div>
          </>
        ) : null}
      </div>

      {/* Playback controls cluster (layout moves based on height breakpoints). */}
      <div id="pip-controls" role="group" aria-label={t`Playback controls`}>
        <button
          type="button"
          title={t`Previous`}
          aria-label={t`Previous`}
          onClick={() => {
            handlePreviousTrack();
          }}
        >
          <HiBackward className="size-6" />
        </button>
        <button
          type="button"
          title={isPlaying ? t`Pause` : t`Play`}
          aria-label={isPlaying ? t`Pause` : t`Play`}
          onClick={() => {
            togglePlayback();
          }}
        >
          {isPlaying ? (
            <HiPause className="size-6" />
          ) : (
            <HiPlay className="size-6" />
          )}
        </button>
        <button
          type="button"
          title={t`Next`}
          aria-label={t`Next`}
          onClick={() => {
            handleNextTrack();
          }}
        >
          <HiForward className="size-6" />
        </button>
      </div>
    </div>
  );
}
