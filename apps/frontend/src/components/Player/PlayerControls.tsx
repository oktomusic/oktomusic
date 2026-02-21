import { Link } from "react-router";
import { t } from "@lingui/core/macro";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  HiArrowTopRightOnSquare,
  HiBackward,
  HiForward,
  HiOutlineQueueList,
  HiOutlineSquare2Stack,
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
import {
  panelOverlayVisibleAtom,
  panelRightVisibleAtom,
} from "../../atoms/app/panels";
import { pipOpenAtom } from "../../atoms/player/pip";
import { formatDuration } from "../../utils/format_duration";

import coverPlaceHolder from "../../assets/pip-cover-placeholder.svg";
import { OktoSlider } from "../Base/OktoSlider";

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
  const [rightVisible, setRightVisible] = useAtom(panelRightVisibleAtom);
  const [overlayVisible, setOverlayVisible] = useAtom(panelOverlayVisibleAtom);

  return (
    <div className="flex h-24 w-full flex-row justify-between p-2">
      <div id="oktomusic:player:title" className="flex w-full flex-row gap-2">
        <img
          className="m-2 aspect-square size-16 rounded-sm"
          fetchPriority="high"
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
            {currentTrack?.artists.map((artist, index) => (
              <span key={artist.id ?? index}>
                <Link to={`/artist/${artist.id}`} className="hover:underline">
                  {artist.name}
                </Link>
                {index < (currentTrack?.artists.length ?? 0) - 1 && ", "}
              </span>
            ))}
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
          <OktoSlider
            id="player-seek"
            min={0}
            max={Math.max(0, playbackDuration)}
            step={250}
            value={Math.min(playbackPosition, playbackDuration || 0)}
            onChange={(v) => {
              requestSeek(v);
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
        className="mr-2 flex h-full w-full flex-row items-center justify-end gap-2"
      >
        <button
          type="button"
          onClick={() => {
            setOverlayVisible((prev) => !prev);
          }}
          aria-label={overlayVisible ? t`Hide overlay` : t`Show overlay`}
          title={overlayVisible ? t`Hide overlay` : t`Show overlay`}
          className={`rounded p-2 hover:bg-white/10 focus-visible:outline-offset-2 ${
            overlayVisible ? "text-white" : "text-slate-500"
          }`}
        >
          <HiOutlineSquare2Stack className="size-6" />
        </button>
        <button
          type="button"
          onClick={() => {
            setRightVisible((prev) => !prev);
          }}
          aria-label={rightVisible ? t`Hide queue` : t`Show queue`}
          title={rightVisible ? t`Hide queue` : t`Show queue`}
          className={`rounded p-2 hover:bg-white/10 focus-visible:outline-offset-2 ${
            rightVisible ? "text-white" : "text-slate-500"
          }`}
        >
          <HiOutlineQueueList className="size-6" />
        </button>
        {!kioskModeEnabled && (
          <button
            onClick={() => {
              setPipOpen(!pipOpen);
            }}
            className={pipOpen ? "text-blue-600" : "text-slate-600"}
            title={
              pipOpen ? t`Close Picture-in-Picture` : t`Open Picture-in-Picture`
            }
          >
            <HiArrowTopRightOnSquare className="size-6" />
          </button>
        )}
      </div>
    </div>
  );
}
