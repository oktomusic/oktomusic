import { atom } from "jotai";

export type BrowserSupport = {
  supported: boolean;
  missing: string[];
};

export function getBrowserSupport(): BrowserSupport {
  if (typeof window === "undefined") {
    return { supported: true, missing: [] };
  }

  const flacSupport = (() => {
    try {
      const audio = document.createElement("audio");
      return audio.canPlayType("audio/flac") !== "";
    } catch {
      return false;
    }
  })();

  const opusSupport = (() => {
    try {
      const audio = document.createElement("audio");
      return audio.canPlayType('audio/ogg; codecs="opus"') !== "";
    } catch {
      return false;
    }
  })();

  const checks: Array<[name: string, ok: boolean]> = [
    ["WebAssembly", "WebAssembly" in window],
    ["IndexedDB", "indexedDB" in window],
    ["LocalStorage", "localStorage" in window],
    ["Persistent Storage", typeof navigator.storage?.persisted === "function"],
    ["WebAudio", "AudioContext" in window],
    ["MediaSource", "MediaSource" in window],
    ["Media Session API", "mediaSession" in navigator],
    ["Background Fetch API", "BackgroundFetchManager" in window],
    ["WakeLock", "wakeLock" in navigator],
    ["FLAC support", flacSupport],
    ["Opus support", opusSupport],
  ];

  const missing = checks.filter(([, ok]) => !ok).map(([name]) => name);
  return { supported: missing.length === 0, missing };
}

export const browserSupportAtom = atom<BrowserSupport>(getBrowserSupport());
export const browserSupportedAtom = atom(
  (get) => get(browserSupportAtom).supported,
);

export const audioSessionSupportAtom = atom<boolean>(
  navigator.audioSession !== undefined,
);
