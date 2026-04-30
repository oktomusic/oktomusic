import { atom } from "jotai";

import {
  AlbumBasic,
  PlaylistBasic,
  Track,
} from "../../api/graphql/gql/graphql";

/** Holds the current AudioContext instance (or null when not initialized). */
export const playerAudioContextAtom = atom<AudioContext | null>(null);

// Queue

export type TrackWithAlbum = Omit<Track, "album"> & {
  album: NonNullable<Track["album"]>;
};

/**
 * A track in the manual queue, extended with a unique `queueEntryId` assigned
 * when the entry is added. This ensures each queue slot has a stable identity
 * even when the same track appears multiple times.
 */
export type QueuedManualTrack = TrackWithAlbum & {
  readonly queueEntryId: string;
};

/** Playback queue as an ordered list of tracks. */
export const playerQueueAtom = atom<TrackWithAlbum[]>([]);

/** Index of the current track in the main queue. */
export const playerQueueMainIndexAtom = atom<number>(0);

// TODO: handle shuffle and repeat modes in main queue

/**
 * The manual queue.
 *
 * This queue is actionned by the "add to queue" buttons.
 *
 * It's meant to take the priority over the main queue when going to the next track.
 *
 * When a track is played, it's removed from the manual queue. When the manual queue is empty, the main queue is used again.
 *
 * There is no need to use an index, since we always play the first track of the manual queue, and remove it once it's played. This simplifies the logic and avoids edge cases with index management.
 */
export const playerQueueManualAtom = atom<QueuedManualTrack[]>([]);

export type PlayerQueueCurrentTrackSource = "main" | "manual" | null;

/** Indicates whether the current track is played from the main or manual queue. */
export const playerQueueCurrentTrackSourceAtom =
  atom<PlayerQueueCurrentTrackSource>(null);

/**
 * Information about the origin of the current queue, if available.
 */
export type PlayerQueueFrom =
  | {
      readonly type: "album";
      readonly id: string;
      readonly meta: AlbumBasic;
    }
  | {
      readonly type: "playlist";
      readonly id: string;
      readonly meta: PlaylistBasic;
    };

/**
 * The main queue's origin information.
 *
 * It is actionned by the "play album" and "play playlist" buttons.
 *
 * Which entity the current queue originates from.
 *
 * This will allow us to restore the queue after a page reload.
 *
 * @see {playerQueueFromNameAtom}
 * @see {playerQueueFromTracksAtom}
 */
export const playerQueueFromAtom = atom<PlayerQueueFrom | null>(null);

export const playerQueueLoad = atom(
  null,
  (_, set, from: PlayerQueueFrom, tracks: TrackWithAlbum[]) => {
    set(playerQueueFromAtom, from);
    set(playerQueueFromTracksAtom, tracks);
  },
);

/**
 *
 */
export const playerQueueFromNameAtom = atom<string | null>();

export const playerQueueFromTracksAtom = atom<TrackWithAlbum[] | null>(null);

const getWrappedMainQueueIndex = (
  index: number,
  queueLength: number,
): number => {
  if (queueLength <= 0) {
    return 0;
  }

  if (index < 0) {
    return queueLength - 1;
  }

  if (index >= queueLength) {
    return 0;
  }

  return index;
};

// TODO: reset to start of track when playback timing is not near the start of the track, with user configuration
/** Move to previous track (wraps) and force playback. */
export const handlePreviousTrackAtom = atom(null, (get, set) => {
  const mainQueue = get(playerQueueAtom);
  const manualQueue = get(playerQueueManualAtom);
  const source = get(playerQueueCurrentTrackSourceAtom);
  let index = get(playerQueueMainIndexAtom);

  if (mainQueue.length === 0 && manualQueue.length === 0) {
    set(playerQueueCurrentTrackSourceAtom, null);
    set(playerShouldPlayAtom, false);
    return;
  }

  if (source === "manual") {
    const remainingManualQueue = manualQueue.slice(1);
    set(playerQueueManualAtom, remainingManualQueue);

    if (remainingManualQueue.length > 0) {
      set(playerQueueCurrentTrackSourceAtom, "manual");
      set(playerShouldPlayAtom, true);
      return;
    }

    if (mainQueue.length === 0) {
      set(playerQueueCurrentTrackSourceAtom, null);
      set(playerShouldPlayAtom, false);
      return;
    }

    // Returning from manual playback should resume the current main queue item.
    set(
      playerQueueMainIndexAtom,
      getWrappedMainQueueIndex(index, mainQueue.length),
    );
    set(playerQueueCurrentTrackSourceAtom, "main");
    set(playerShouldPlayAtom, true);
    return;
  }

  if (mainQueue.length === 0) {
    set(
      playerQueueCurrentTrackSourceAtom,
      manualQueue.length > 0 ? "manual" : null,
    );
    set(playerShouldPlayAtom, manualQueue.length > 0);
    return;
  }

  index = getWrappedMainQueueIndex(index - 1, mainQueue.length);
  set(playerQueueMainIndexAtom, index);
  set(playerQueueCurrentTrackSourceAtom, "main");
  set(playerShouldPlayAtom, true);
});

export const handleNextTrackAtom = atom(null, (get, set) => {
  const mainQueue = get(playerQueueAtom);
  const manualQueue = get(playerQueueManualAtom);
  const source = get(playerQueueCurrentTrackSourceAtom);
  const index = get(playerQueueMainIndexAtom);

  if (mainQueue.length === 0 && manualQueue.length === 0) {
    set(playerQueueCurrentTrackSourceAtom, null);
    set(playerShouldPlayAtom, false);
    return;
  }

  if (source === "manual" && manualQueue.length > 0) {
    const remainingManualQueue = manualQueue.slice(1);
    set(playerQueueManualAtom, remainingManualQueue);

    if (remainingManualQueue.length > 0) {
      set(playerQueueCurrentTrackSourceAtom, "manual");
      set(playerShouldPlayAtom, true);
      return;
    }

    if (mainQueue.length > 0) {
      set(
        playerQueueMainIndexAtom,
        getWrappedMainQueueIndex(index + 1, mainQueue.length),
      );
      set(playerQueueCurrentTrackSourceAtom, "main");
      set(playerShouldPlayAtom, true);
      return;
    }

    set(playerQueueCurrentTrackSourceAtom, null);
    set(playerShouldPlayAtom, false);
    return;
  }

  if (manualQueue.length > 0) {
    set(playerQueueCurrentTrackSourceAtom, "manual");
    set(playerShouldPlayAtom, true);
    return;
  }

  if (mainQueue.length > 0) {
    set(
      playerQueueMainIndexAtom,
      getWrappedMainQueueIndex(index + 1, mainQueue.length),
    );
    set(playerQueueCurrentTrackSourceAtom, "main");
    set(playerShouldPlayAtom, true);
    return;
  }

  set(playerQueueCurrentTrackSourceAtom, null);
  set(playerShouldPlayAtom, false);
});

/** Move to a specific track in the queue by index. */
export const handleSeekToQueueIndexAtom = atom(
  null,
  (get, set, targetIndex: number) => {
    const mainQueue = get(playerQueueAtom);

    if (
      mainQueue.length === 0 ||
      targetIndex < 0 ||
      targetIndex >= mainQueue.length
    ) {
      return;
    }

    set(playerQueueMainIndexAtom, targetIndex);
    set(playerQueueCurrentTrackSourceAtom, "main");
    set(playerShouldPlayAtom, true);
  },
);

/** Move to a specific track in the manual queue by index and drop previous manual items. */
export const handleSeekToManualQueueIndexAtom = atom(
  null,
  (get, set, targetIndex: number) => {
    const manualQueue = get(playerQueueManualAtom);

    if (
      manualQueue.length === 0 ||
      targetIndex < 0 ||
      targetIndex >= manualQueue.length
    ) {
      return;
    }

    set(playerQueueManualAtom, manualQueue.slice(targetIndex));
    set(playerQueueCurrentTrackSourceAtom, "manual");
    set(playerShouldPlayAtom, true);
  },
);

/** Action: Replace the queue with new tracks and start playing from the first track. */
export const replaceQueueAtom = atom(
  null,
  (_get, set, tracks: TrackWithAlbum[]) => {
    set(playerQueueAtom, tracks);
    set(playerQueueMainIndexAtom, 0);
    set(playerQueueManualAtom, []);
    set(playerQueueCurrentTrackSourceAtom, tracks.length > 0 ? "main" : null);
    set(playerShouldPlayAtom, tracks.length > 0);
  },
);

/** Action: Add tracks to the end of the queue. */
export const addToQueueAtom = atom(
  null,
  (get, set, tracks: TrackWithAlbum[]) => {
    if (tracks.length === 0) {
      return;
    }

    const mainQueue = get(playerQueueAtom);
    const manualQueue = get(playerQueueManualAtom);
    const source = get(playerQueueCurrentTrackSourceAtom);

    const hasCurrentTrack =
      (source === "manual" && manualQueue.length > 0) || mainQueue.length > 0;

    const queuedTracks: QueuedManualTrack[] = tracks.map((track) => ({
      ...track,
      queueEntryId: crypto.randomUUID(),
    }));

    set(playerQueueManualAtom, [...manualQueue, ...queuedTracks]);

    if (!hasCurrentTrack) {
      set(playerQueueCurrentTrackSourceAtom, "manual");
      set(playerShouldPlayAtom, true);
    }
  },
);

/** Derived current track from queue + index, safe for empty queues. */
export const playerQueueCurrentTrack = atom<TrackWithAlbum | null>((get) => {
  const source = get(playerQueueCurrentTrackSourceAtom);
  const mainQueue = get(playerQueueAtom);
  const manualQueue = get(playerQueueManualAtom);
  const index = get(playerQueueMainIndexAtom);

  if (source === "manual" && manualQueue.length > 0) {
    return manualQueue[0] ?? null;
  }

  if (mainQueue.length > 0) {
    if (index < 0 || index >= mainQueue.length) {
      return mainQueue[0] ?? null;
    }

    return mainQueue[index] ?? null;
  }

  if (manualQueue.length > 0) {
    return manualQueue[0] ?? null;
  }

  return null;
});

export interface VibrantColors {
  readonly vibrant: string;
  readonly darkVibrant: string;
  readonly lightVibrant: string;
  readonly muted: string;
  readonly darkMuted: string;
  readonly lightMuted: string;
}

export type VibrantColorsPartial = Partial<VibrantColors>;

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
  const currentTrack = get(playerQueueCurrentTrack);
  if (!currentTrack) {
    set(playerShouldPlayAtom, false);
    return;
  }
  set(playerShouldPlayAtom, !get(playerShouldPlayAtom));
});

/** Action: set playback intent to play. */
export const requestPlaybackPlayAtom = atom(null, (get, set) => {
  const currentTrack = get(playerQueueCurrentTrack);
  if (!currentTrack) {
    return;
  }
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
