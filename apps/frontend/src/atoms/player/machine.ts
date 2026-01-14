import { atom } from "jotai";

import { Track } from "../../api/graphql/gql/graphql";

export const playerAudioContextAtom = atom<AudioContext | null>(null);

// Queue

export type TrackWithAlbum = Omit<Track, "album"> & {
  album: NonNullable<Track["album"]>;
};

// TODO: implement primaray queue and secondary queue (for next up)

export const playerQueueAtom = atom<TrackWithAlbum[]>([]);

export const playerQueueIndexAtom = atom<number>(0);

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
});

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

export const playerQueueCurrentTrackFile = atom<string | null>((get) => {
  const currentTrack = get(playerQueueCurrentTrack);
  if (!currentTrack || !currentTrack.flacFileId) {
    return null;
  }

  return `/api/media/${currentTrack.flacFileId}`;
});

export const playerPlaybackPositionAtom = atom<number>(0);

// Currently only webaudio is supported
// We plan to allow remote control via SocketIO
export const engineAtom = atom<"webaudio">("webaudio");
