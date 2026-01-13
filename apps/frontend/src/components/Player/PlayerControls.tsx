import { useAtom, useAtomValue } from "jotai";
import { t } from "@lingui/core/macro";

import { playerQueueCurrentTrack } from "../../atoms/player/machine";
import { settingClientKioskMode } from "../../atoms/app/settings_client";
import { pipOpenAtom } from "../../atoms/player/pip";

import coverPlaceHolder from "../../assets/pip-cover-placeholder.svg";
import {
  HiArrowTopRightOnSquare,
  HiBackward,
  HiForward,
  HiPause,
  HiPlay,
} from "react-icons/hi2";

export default function PlayerControls() {
  const currentTrack = useAtomValue(playerQueueCurrentTrack);

  const kioskModeEnabled = useAtomValue(settingClientKioskMode);

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
            onClick={() => undefined}
            aria-label={t`Previous`}
            title={t`Previous`}
            className="rounded p-2 hover:bg-white/10 focus-visible:outline-offset-2"
          >
            <HiBackward className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => undefined}
            // eslint-disable-next-line no-constant-condition
            aria-label={true ? t`Pause` : t`Play`}
            // eslint-disable-next-line no-constant-condition
            title={true ? t`Pause` : t`Play`}
            className="rounded p-2 hover:bg-white/10 focus-visible:outline-offset-2"
          >
            {window ? (
              <HiPause className="size-6" />
            ) : (
              <HiPlay className="size-6" />
            )}
          </button>
          <button
            type="button"
            onClick={() => undefined}
            aria-label={t`Next`}
            title={t`Next`}
            className="rounded p-2 hover:bg-white/10 focus-visible:outline-offset-2"
          >
            <HiForward className="size-6" />
          </button>
        </div>
        <div className="flex flex-row gap-2">
          <span className="font-mono slashed-zero">0:00</span>
          <label htmlFor="player-seek" className="sr-only">
            {t`Seek`}
          </label>
          <input
            id="player-seek"
            type="range"
            min={0}
            max={100}
            step={0.1}
            className="w-full"
          />
          <span className="font-mono slashed-zero">3:22</span>
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
