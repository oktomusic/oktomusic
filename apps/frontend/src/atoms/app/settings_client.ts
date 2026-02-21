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

export type AudioSessionKey = "ambient" | "playback";

export const settingClientAudioSession = atomWithStorage<AudioSessionKey>(
  audioSessionLocalStorageKey,
  "ambient",
  undefined,
  {
    getOnInit: true,
  },
);

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

export type WakeLockKey = "always" | "playback" | "never";

export const settingClientWakeLock = atomWithStorage<WakeLockKey>(
  wakeLockLocalStorageKey,
  "never",
  undefined,
  {
    getOnInit: true,
  },
);

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

// Lyrics display mode

const lyricsDisplayModeLocalStorageKey = "oktomusic:lyrics_display_mode";

/**
 * Defines the mode for displaying lyrics in the application.
 *
 * - "word": Displays lyrics word by word, highlighting the current word being sung. A non-word-synced line will be treated as a single word and highlighted as a whole.
 * - "line": Displays lyrics line by line, highlighting the current line being sung.
 * - "static": Displays the entire lyrics without any highlighting or synchronization.
 */
export type LyricsDisplayModeKey = "word" | "line" | "static";

export const settingClientLyricsDisplayMode =
  atomWithStorage<LyricsDisplayModeKey>(
    lyricsDisplayModeLocalStorageKey,
    "word",
    undefined,
    {
      getOnInit: true,
    },
  );
