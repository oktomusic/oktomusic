import { Button } from "@headlessui/react";
import { t } from "@lingui/core/macro";
import { useAtom, useAtomValue } from "jotai";
import {
  HiArrowTopRightOnSquare,
  HiOutlineQueueList,
  HiOutlineSquare2Stack,
} from "react-icons/hi2";

import {
  settingClientKioskMode,
  settingClientVolumeEnabled,
} from "../../atoms/app/settings_client";
import { pipOpenAtom } from "../../atoms/player/pip";
import {
  panelOverlayVisibleAtom,
  panelRightVisibleAtom,
} from "../../atoms/app/panels";
import { PlayerControlsVolume } from "./PlayerControlsVolume";

export function PlayerControlsAdditional() {
  const kioskModeEnabled = useAtomValue(settingClientKioskMode);
  const volumeEnabled = useAtomValue(settingClientVolumeEnabled);

  const [pipOpen, setPipOpen] = useAtom(pipOpenAtom);
  const [rightVisible, setRightVisible] = useAtom(panelRightVisibleAtom);
  const [overlayVisible, setOverlayVisible] = useAtom(panelOverlayVisibleAtom);

  return (
    <div
      id="oktomusic:player:additional"
      className="mr-2 flex h-full w-full flex-row items-center justify-end gap-2"
    >
      <Button
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
      </Button>
      <Button
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
      </Button>
      {volumeEnabled && <PlayerControlsVolume />}
      {!kioskModeEnabled && (
        <Button
          type="button"
          onClick={() => {
            setPipOpen(!pipOpen);
          }}
          className={
            "rounded p-2 hover:bg-white/10 focus-visible:outline-offset-2" +
            (pipOpen ? " text-white" : " text-slate-500")
          }
          title={
            pipOpen ? t`Close Picture-in-Picture` : t`Open Picture-in-Picture`
          }
        >
          <HiArrowTopRightOnSquare className="size-6" />
        </Button>
      )}
    </div>
  );
}
