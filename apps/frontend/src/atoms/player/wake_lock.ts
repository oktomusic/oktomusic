import { atom } from "jotai";

import { settingClientWakeLock } from "../app/settings_client";
import { playerShouldPlayAtom } from "./machine";

export const shouldHoldWakeLockAtom = atom((get) => {
  const mode = get(settingClientWakeLock);
  const isPlaying = get(playerShouldPlayAtom);

  if (mode === "always") return true;
  if (mode === "playback") return isPlaying;

  return false;
});
