import { t } from "@lingui/core/macro";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  HiArrowTopRightOnSquare,
  HiBackward,
  HiForward,
  HiPause,
  HiPlay,
} from "react-icons/hi2";

import {
  handleNextTrackAtom,
  handlePreviousTrackAtom,
  playerIsBufferingAtom,
  playerIsPlayingAtom,
  playerPlaybackDurationAtom,
  playerPlaybackPositionAtom,
  playerQueueCurrentTrack,
  requestPlaybackToggleAtom,
  requestSeekAtom,
} from "../../atoms/player/machine";
import { settingClientKioskMode } from "../../atoms/app/settings_client";
import { pipOpenAtom } from "../../atoms/player/pip";
import { formatDuration } from "../../utils/format_duration";

import coverPlaceHolder from "../../assets/pip-cover-placeholder.svg";

export default function PlayerControls() {
  const currentTrack = useAtomValue(playerQueueCurrentTrack);
  const playbackPosition = useAtomValue(playerPlaybackPositionAtom);
  const playbackDuration = useAtomValue(playerPlaybackDurationAtom);
  const isPlaying = useAtomValue(playerIsPlayingAtom);
  const isBuffering = useAtomValue(playerIsBufferingAtom);

  const kioskModeEnabled = useAtomValue(settingClientKioskMode);

  const handlePreviousTrack = useSetAtom(handlePreviousTrackAtom);
  const handleNextTrack = useSetAtom(handleNextTrackAtom);

  const togglePlayback = useSetAtom(requestPlaybackToggleAtom);
  const requestSeek = useSetAtom(requestSeekAtom);

  const [pipOpen, setPipOpen] = useAtom(pipOpenAtom);

  return (
    <div className="flex h-24 w-full flex-row justify-between p-2">
      <div id="oktomusic:player:title" className="flex w-full flex-row gap-2">
        <img
          className="m-2 aspect-square rounded-sm"
          src={
            currentTrack
              ? `/api/album/${currentTrack.album.id}/cover/256`
              : coverPlaceHolder
          }
          draggable={false}
          alt={currentTrack ? "Album Cover" : t`No track playing`}
        />
        <div className="flex h-full flex-col justify-center">
          <span className="font-semibold">{currentTrack?.name}</span>
          <span className="">
            {currentTrack?.artists.map((artist) => artist.name).join(", ")}
          </span>
        </div>
      </div>
      <div
        id="oktomusic:player:controls"
        className="flex h-full w-full flex-col"
        aria-label={t`Playback controls`}
      >
        <div className="flex flex-row justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              handlePreviousTrack();
            }}
            aria-label={t`Previous`}
            title={t`Previous`}
            className="rounded p-2 hover:bg-white/10 focus-visible:outline-offset-2"
          >
            <HiBackward className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => {
              togglePlayback();
            }}
            aria-label={isPlaying ? t`Pause` : t`Play`}
            title={isPlaying ? t`Pause` : t`Play`}
            className="rounded p-2 hover:bg-white/10 focus-visible:outline-offset-2"
          >
            {isPlaying ? (
              <HiPause className="size-6" />
            ) : (
              <HiPlay className="size-6" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              handleNextTrack();
            }}
            aria-label={t`Next`}
            title={t`Next`}
            className="rounded p-2 hover:bg-white/10 focus-visible:outline-offset-2"
          >
            <HiForward className="size-6" />
          </button>
        </div>
        <div className="flex flex-row items-center gap-2">
          <span className="font-mono slashed-zero">
            {formatDuration(playbackPosition)}
          </span>
          <label htmlFor="player-seek" className="sr-only">
            {t`Seek`}
          </label>
          <input
            id="player-seek"
            type="range"
            min={0}
            max={Math.max(0, playbackDuration)}
            step={250}
            value={Math.min(playbackPosition, playbackDuration || 0)}
            onChange={(event) => {
              requestSeek(Number(event.target.value));
            }}
            className="w-full"
          />
          <span className="font-mono slashed-zero">
            {formatDuration(currentTrack?.durationMs ?? playbackDuration)}
          </span>
          {isBuffering && (
            <p className="text-xs text-slate-400" aria-live="polite">
              {t`Buffering…`}
            </p>
          )}
        </div>
      </div>
      <div
        id="oktomusic:player:additional"
        className="mr-2 flex h-full w-full flex-row place-content-end justify-end gap-2"
      >
        {!kioskModeEnabled && (
          <button
            onClick={() => {
              setPipOpen(!pipOpen);
            }}
            className={pipOpen ? "text-blue-600" : "text-slate-600"}
          >
            <HiArrowTopRightOnSquare className="size-6" />
          </button>
        )}
      </div>
    </div>
  );
}
