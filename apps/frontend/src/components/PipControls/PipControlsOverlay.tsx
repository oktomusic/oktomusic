import { useAtomValue, useSetAtom } from "jotai";
import { HiBackward, HiForward, HiPause, HiPlay } from "react-icons/hi2";
import { t } from "@lingui/core/macro";

import { OktoSlider } from "../Base/OktoSlider";
import {
  handleNextTrackAtom,
  handlePreviousTrackAtom,
  playerPlaybackDurationAtom,
  playerPlaybackPositionAtom,
  playerQueueCurrentTrack,
  playerShouldPlayAtom,
  requestPlaybackToggleAtom,
  requestSeekAtom,
} from "../../atoms/player/machine";
import { formatDuration } from "../../utils/format_duration";

export function PipControlsOverlay() {
  const currentTrack = useAtomValue(playerQueueCurrentTrack);
  const playbackPosition = useAtomValue(playerPlaybackPositionAtom);
  const playbackDuration = useAtomValue(playerPlaybackDurationAtom);
  const shouldPlay = useAtomValue(playerShouldPlayAtom);

  const handlePreviousTrack = useSetAtom(handlePreviousTrackAtom);
  const handleNextTrack = useSetAtom(handleNextTrackAtom);

  const togglePlayback = useSetAtom(requestPlaybackToggleAtom);
  const requestSeek = useSetAtom(requestSeekAtom);

  return (
    <div id="pip-hover-overlay">
      <div id="pip-hover_overlay__center">
        <div
          id="pip-hover_overlay__controls"
          role="group"
          aria-label={t`Playback controls`}
        >
          <button
            type="button"
            title={t`Previous`}
            aria-label={t`Previous`}
            onClick={() => {
              handlePreviousTrack();
            }}
          >
            <HiBackward />
          </button>
          <button
            type="button"
            title={shouldPlay ? t`Pause` : t`Play`}
            aria-label={shouldPlay ? t`Pause` : t`Play`}
            onClick={() => {
              togglePlayback();
            }}
            id="pip-hover_overlay__controls__playpause"
          >
            {shouldPlay ? <HiPause /> : <HiPlay />}
          </button>
          <button
            type="button"
            title={t`Next`}
            aria-label={t`Next`}
            onClick={() => {
              handleNextTrack();
            }}
          >
            <HiForward />
          </button>
        </div>
      </div>
      <div id="pip-hover_overlay__seek">
        <div id="pip-hover_overlay__seek__times">
          <span>{formatDuration(playbackPosition)}</span>
          <span>
            {formatDuration(currentTrack?.durationMs ?? playbackDuration)}
          </span>
        </div>
        <OktoSlider
          id="pip-hover_overlay__seek__slider"
          min={0}
          max={Math.max(0, playbackDuration)}
          step={250}
          value={Math.min(playbackPosition, playbackDuration || 0)}
          onChange={(v) => {
            requestSeek(v);
          }}
        />
      </div>
    </div>
  );
}
