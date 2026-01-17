import { atomWithStorage } from "jotai/utils";

// Kiosk Mode Setting

const kioskModeLocalStorageKey = "oktomusic:kiosk_mode";

export const settingClientKioskMode = atomWithStorage<boolean>(
  kioskModeLocalStorageKey,
  false,
  undefined,
  {
    getOnInit: true,
  },
);

// Audio Session Setting

const audioSessionLocalStorageKey = "oktomusic:audio_session";

export const settingClientAudioSession = atomWithStorage<
  "ambient" | "playback"
>(audioSessionLocalStorageKey, "ambient", undefined, {
  getOnInit: true,
});

// Crossfade Setting

const crossfadeLocalStorageKey = "oktomusic:crossfade_seconds";

export const settingClientCrossfadeSeconds = atomWithStorage<number>(
  crossfadeLocalStorageKey,
  0,
  undefined,
  {
    getOnInit: true,
  },
);

// Wake Lock Setting

const wakeLockLocalStorageKey = "oktomusic:wake_lock";

export const settingClientWakeLock = atomWithStorage<
  "always" | "playback" | "never"
>(wakeLockLocalStorageKey, "never", undefined, {
  getOnInit: true,
});
