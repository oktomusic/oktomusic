import { atomWithStorage, createJSONStorage } from "jotai/utils";

// Kiosk Mode Setting

const kioskModeLocalStorageKey = "oktomusic:kiosk_mode";

const kioskModeStorage = createJSONStorage<boolean>(() => window.localStorage);

export const settingClientKioskMode = atomWithStorage<boolean>(
  kioskModeLocalStorageKey,
  false,
  kioskModeStorage,
  {
    getOnInit: true,
  },
);

// Audio Session Setting

const audioSessionLocalStorageKey = "oktomusic:audio_session";

const audioSessionStorage = createJSONStorage<"ambient" | "playback">(
  () => window.localStorage,
);

export const settingClientAudioSession = atomWithStorage<
  "ambient" | "playback"
>(audioSessionLocalStorageKey, "ambient", audioSessionStorage, {
  getOnInit: true,
});

// Crossfade Setting

const crossfadeLocalStorageKey = "oktomusic:crossfade_seconds";

const crossfadeStorage = createJSONStorage<number>(() => window.localStorage);

export const settingClientCrossfadeSeconds = atomWithStorage<number>(
  crossfadeLocalStorageKey,
  0,
  crossfadeStorage,
  {
    getOnInit: true,
  },
);
