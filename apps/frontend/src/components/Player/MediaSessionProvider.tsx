import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import {
  handleNextTrackAtom,
  handlePreviousTrackAtom,
  playerIsPlayingAtom,
  playerPlaybackDurationAtom,
  playerPlaybackPositionAtom,
  playerPlaybackStateAtom,
  playerQueueCurrentTrack,
  requestPlaybackPauseAtom,
  requestPlaybackPlayAtom,
  requestSeekAtom,
} from "../../atoms/player/machine";
import { buildMediaMetadata } from "../../utils/media_metadata";

/**
 * Provider for the [Media Session API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API) integration.
 *
 * @see https://web.dev/articles/media-session
 */
export default function MediaSessionProvider() {
  const currentTrack = useAtomValue(playerQueueCurrentTrack);
  const playbackState = useAtomValue(playerPlaybackStateAtom);
  const isPlaying = useAtomValue(playerIsPlayingAtom);
  const playbackPosition = useAtomValue(playerPlaybackPositionAtom);
  const playbackDuration = useAtomValue(playerPlaybackDurationAtom);

  const requestPlay = useSetAtom(requestPlaybackPlayAtom);
  const requestPause = useSetAtom(requestPlaybackPauseAtom);
  const requestSeek = useSetAtom(requestSeekAtom);
  const handleNextTrack = useSetAtom(handleNextTrackAtom);
  const handlePreviousTrack = useSetAtom(handlePreviousTrackAtom);

  // mediaSession is a required API, we already check for its presence in browser support atom
  useEffect(() => {
    if (!currentTrack) {
      navigator.mediaSession.metadata = null;
      return;
    }

    navigator.mediaSession.metadata = buildMediaMetadata(currentTrack);
  }, [currentTrack]);

  useEffect(() => {
    if (!currentTrack) {
      return;
    }

    if (typeof navigator.mediaSession.setPositionState !== "function") {
      return;
    }

    if (!Number.isFinite(playbackDuration) || playbackDuration <= 0) {
      return;
    }

    const durationSeconds = Math.max(0, playbackDuration / 1000);
    const positionSeconds = Math.max(
      0,
      Math.min(playbackPosition / 1000, durationSeconds),
    );

    navigator.mediaSession.setPositionState({
      duration: durationSeconds,
      playbackRate: 1,
      position: positionSeconds,
    });
  }, [currentTrack, playbackDuration, playbackPosition]);

  useEffect(() => {
    navigator.mediaSession.setActionHandler("play", () => {
      requestPlay();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      requestPause();
    });
    navigator.mediaSession.setActionHandler("previoustrack", () => {
      handlePreviousTrack();
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      handleNextTrack();
    });
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (typeof details.seekTime !== "number") {
        return;
      }
      requestSeek(Math.max(0, details.seekTime * 1000));
    });

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("seekto", null);
    };
  }, [
    handleNextTrack,
    handlePreviousTrack,
    requestPause,
    requestPlay,
    requestSeek,
  ]);

  useEffect(() => {
    if (!currentTrack) {
      navigator.mediaSession.playbackState = "none";
      return;
    }

    if (playbackState === "buffering") {
      navigator.mediaSession.playbackState = "playing";
      return;
    }

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [currentTrack, isPlaying, playbackState]);

  return null;
}
