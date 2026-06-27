import { useAtomValue, useSetAtom } from "jotai";
import { useLingui } from "@lingui/react/macro";
import { Button } from "@base-ui/react/button";
import { LuPause, LuPlay, LuSkipBack, LuSkipForward } from "react-icons/lu";

import { formatDuration } from "../../utils/format_duration";
import {
  handleNextTrackAtom,
  handlePreviousTrackAtom,
  playerIsBufferingAtom,
  playerIsPlayingAtom,
  playerPlaybackDurationAtom,
  playerPlaybackPositionAtom,
  playerQueueCurrentTrack,
  playerShouldPlayAtom,
  requestPlaybackToggleAtom,
  requestSeekAtom,
} from "../../atoms/player/machine";
import { OktoSlider } from "../Base/OktoSlider";

export function PlayerControlsPlayback() {
  const { t } = useLingui();

  const currentTrack = useAtomValue(playerQueueCurrentTrack);
  const playbackPosition = useAtomValue(playerPlaybackPositionAtom);
  const playbackDuration = useAtomValue(playerPlaybackDurationAtom);
  const isPlaying = useAtomValue(playerIsPlayingAtom);
  const isBuffering = useAtomValue(playerIsBufferingAtom);
  const shouldPlay = useAtomValue(playerShouldPlayAtom);

  const handlePreviousTrack = useSetAtom(handlePreviousTrackAtom);
  const handleNextTrack = useSetAtom(handleNextTrackAtom);

  const togglePlayback = useSetAtom(requestPlaybackToggleAtom);
  const requestSeek = useSetAtom(requestSeekAtom);

  return (
    <div
      id="oktomusic:player:controls"
      className="flex h-full w-full flex-col justify-center"
      aria-label={t`Playback controls`}
    >
      <div className="flex flex-row justify-center gap-2">
        <Button
          type="button"
          onClick={() => {
            handlePreviousTrack();
          }}
          aria-label={t`Previous`}
          title={t`Previous`}
          className="rounded p-2 hover:bg-white/10 focus-visible:outline-offset-2"
        >
          <LuSkipBack className="size-6" />
        </Button>
        <Button
          type="button"
          onClick={() => {
            togglePlayback();
          }}
          aria-label={isPlaying ? t`Pause` : t`Play`}
          title={isPlaying ? t`Pause` : t`Play`}
          className="rounded p-2 hover:bg-white/10 focus-visible:outline-offset-2"
        >
          {shouldPlay ? (
            <LuPause className="size-6" />
          ) : (
            <LuPlay className="size-6" />
          )}
        </Button>
        <Button
          type="button"
          onClick={() => {
            handleNextTrack();
          }}
          aria-label={t`Next`}
          title={t`Next`}
          className="rounded p-2 hover:bg-white/10 focus-visible:outline-offset-2"
        >
          <LuSkipForward className="size-6" />
        </Button>
      </div>
      <div className="flex flex-row items-center gap-2">
        <span className="font-mono slashed-zero">
          {formatDuration(playbackPosition)}
        </span>
        <OktoSlider
          id="player-seek"
          aria-label={t`Seek`}
          min={0}
          /* Avoid max=0 which causes Base UI to complain */
          max={Math.max(1, playbackDuration)}
          step={250}
          value={Math.min(playbackPosition, playbackDuration || 0)}
          onChange={(v) => {
            requestSeek(v);
          }}
          isLoading={isBuffering}
          className="w-full"
        />
        <span className="font-mono slashed-zero">
          {formatDuration(currentTrack?.durationMs ?? playbackDuration)}
        </span>
      </div>
    </div>
  );
}
