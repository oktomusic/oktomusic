import { atom } from "jotai";

import { Track } from "../../api/graphql/gql/graphql";

/** Holds the current AudioContext instance (or null when not initialized). */
export const playerAudioContextAtom = atom<AudioContext | null>(null);

// Queue

export type TrackWithAlbum = Omit<Track, "album"> & {
  album: NonNullable<Track["album"]>;
};

// TODO: implement primaray queue and secondary queue (for next up)

/** Playback queue as an ordered list of tracks. */
export const playerQueueAtom = atom<TrackWithAlbum[]>([]);

/** Index of the current track in the queue. */
export const playerQueueIndexAtom = atom<number>(0);

/** Move to previous track (wraps) and force playback. */
export const handlePreviousTrackAtom = atom(null, (get, set) => {
  const queue = get(playerQueueAtom);
  let index = get(playerQueueIndexAtom);

  if (queue.length === 0) {
    return;
  }

  index -= 1;
  if (index < 0) {
    index = queue.length - 1; // Loop back to end
  }

  set(playerQueueIndexAtom, index);
  set(playerShouldPlayAtom, true);
});

export const handleNextTrackAtom = atom(null, (get, set) => {
  const queue = get(playerQueueAtom);
  let index = get(playerQueueIndexAtom);

  if (queue.length === 0) {
    return;
  }

  index += 1;
  if (index >= queue.length) {
    index = 0; // Loop back to start
  }

  set(playerQueueIndexAtom, index);
  set(playerShouldPlayAtom, true);
});

/** Move to a specific track in the queue by index. */
export const handleSeekToQueueIndexAtom = atom(
  null,
  (get, set, targetIndex: number) => {
    const queue = get(playerQueueAtom);

    if (queue.length === 0 || targetIndex < 0 || targetIndex >= queue.length) {
      return;
    }

    set(playerQueueIndexAtom, targetIndex);
    set(playerShouldPlayAtom, true);
  },
);

/** Action: Replace the queue with new tracks and start playing from the first track. */
export const replaceQueueAtom = atom(
  null,
  (_get, set, tracks: TrackWithAlbum[]) => {
    set(playerQueueAtom, tracks);
    set(playerQueueIndexAtom, 0);
    set(playerShouldPlayAtom, true);
  },
);

/** Action: Add tracks to the end of the queue. */
export const addToQueueAtom = atom(
  null,
  (get, set, tracks: TrackWithAlbum[]) => {
    const currentQueue = get(playerQueueAtom);
    set(playerQueueAtom, [...currentQueue, ...tracks]);
  },
);

/** Derived current track from queue + index, safe for empty queues. */
export const playerQueueCurrentTrack = atom<TrackWithAlbum | null>((get) => {
  const queue = get(playerQueueAtom);
  const index = get(playerQueueIndexAtom);

  if (queue.length === 0) {
    return null;
  }

  if (index < 0 || index >= queue.length) {
    return queue[0] ?? null;
  }

  return queue[index] ?? null;
});

export interface VibrantColors {
  readonly vibrant: string;
  readonly darkVibrant: string;
  readonly lightVibrant: string;
  readonly muted: string;
  readonly darkMuted: string;
  readonly lightMuted: string;
}

/** Derived vibrant colors from the current track's album cover. */
export const playerCurrentTrackColors = atom<VibrantColors | null>((get) => {
  const currentTrack = get(playerQueueCurrentTrack);
  if (!currentTrack) {
    return null;
  }

  return {
    vibrant: currentTrack.album.coverColorVibrant,
    darkVibrant: currentTrack.album.coverColorDarkVibrant,
    lightVibrant: currentTrack.album.coverColorLightVibrant,
    muted: currentTrack.album.coverColorMuted,
    darkMuted: currentTrack.album.coverColorDarkMuted,
    lightMuted: currentTrack.album.coverColorLightMuted,
  };
});

/** Derived media URL for the current track, or null if unavailable. */
export const playerQueueCurrentTrackFile = atom<string | null>((get) => {
  const currentTrack = get(playerQueueCurrentTrack);
  if (!currentTrack || !currentTrack.flacFileId) {
    return null;
  }

  return `/api/media/${currentTrack.flacFileId}`;
});

/** Current playback position in milliseconds. */
export const playerPlaybackPositionAtom = atom<number>(0);

/** Current track duration in milliseconds. */
export const playerPlaybackDurationAtom = atom<number>(0);

export type PlayerPlaybackState = "idle" | "playing" | "paused" | "buffering";

/** Canonical playback state for UI and Media Session. */
export const playerPlaybackStateAtom = atom<PlayerPlaybackState>("idle");

/** Derived boolean for playing state. */
export const playerIsPlayingAtom = atom(
  (get) => get(playerPlaybackStateAtom) === "playing",
);

/** Derived boolean for buffering state. */
export const playerIsBufferingAtom = atom(
  (get) => get(playerPlaybackStateAtom) === "buffering",
);

/** User intent: true when playback should be running. */
export const playerShouldPlayAtom = atom<boolean>(false);

/** One-shot seek request in milliseconds; consumed by provider. */
export const playerSeekRequestAtom = atom<number | null>(null);

/** Action: toggle the user playback intent. */
export const requestPlaybackToggleAtom = atom(null, (get, set) => {
  set(playerShouldPlayAtom, !get(playerShouldPlayAtom));
});

/** Action: set playback intent to play. */
export const requestPlaybackPlayAtom = atom(null, (_get, set) => {
  set(playerShouldPlayAtom, true);
});

/** Action: set playback intent to pause. */
export const requestPlaybackPauseAtom = atom(null, (_get, set) => {
  set(playerShouldPlayAtom, false);
});

/** Action: request a seek to the provided position in milliseconds. */
export const requestSeekAtom = atom(null, (_get, set, positionMs: number) => {
  set(playerSeekRequestAtom, positionMs);
});

// Currently only webaudio is supported
// We plan to allow remote control via SocketIO
/** Current playback engine identifier. */
export const engineAtom = atom<"webaudio">("webaudio");
