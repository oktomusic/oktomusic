import { useEffect, useRef } from "react";
import { useAtomValue } from "jotai";
import { t } from "@lingui/core/macro";
import { HiBackward, HiForward, HiPlay } from "react-icons/hi2";

import PipButton from "./PipButton";
import { playerQueueCurrentTrack } from "../../atoms/player/machine";
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
  const isPlaying = false;

  const currentTrack = useAtomValue(playerQueueCurrentTrack);

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
              ? `/api/album/${currentTrack.albumId}/cover/1280`
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
            <a href={`/album/${currentTrack.albumId}`}>{currentTrack?.name}</a>
            <div id="pip-artists">
              {currentTrack.artists.map((artist) => artist.name).join(", ")}
            </div>
          </>
        ) : null}
      </div>

      {/* Playback controls cluster (layout moves based on height breakpoints). */}
      <div id="pip-controls" role="group" aria-label={t`Playback controls`}>
        <PipButton title={t`Previous`} icon={HiBackward} />
        <PipButton
          title={isPlaying ? t`Pause` : t`Play`}
          icon={HiPlay}
          disabled={!currentTrack}
        />
        <PipButton title={t`Next`} icon={HiForward} />
      </div>
    </div>
  );
}
