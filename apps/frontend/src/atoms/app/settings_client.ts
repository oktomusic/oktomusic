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

// SW Config Settings

const swMediaMaxEntriesLocalStorageKey = "oktomusic:sw_media_max_entries";
const swMediaMaxAgeLocalStorageKey = "oktomusic:sw_media_max_age";

export const settingClientSWMediaMaxEntries = atomWithStorage<number | null>(
  swMediaMaxEntriesLocalStorageKey,
  100, // Default: 100 entries
  undefined,
  {
    getOnInit: true,
  },
);

export const settingClientSWMediaMaxAge = atomWithStorage<number | null>(
  swMediaMaxAgeLocalStorageKey,
  7 * 24 * 60 * 60, // Default: 7 days in seconds
  undefined,
  {
    getOnInit: true,
  },
);
