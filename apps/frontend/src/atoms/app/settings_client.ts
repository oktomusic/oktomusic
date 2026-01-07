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
