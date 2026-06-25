import { useEffect, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import {
  handleNextTrackAtom,
  playerAudioContextAtom,
  playerCurrentManualQueueEntryIdAtom,
  playerPlaybackDurationAtom,
  playerPlaybackPositionAtom,
  playerPlaybackStateAtom,
  playerQueueCurrentTrackFile,
  playerQueueMainIndexAtom,
  playerSeekRequestAtom,
  playerShouldPlayAtom,
} from "../../atoms/player/machine";
import { playerVolume } from "../../atoms/app/settings_client";

export function PlayerProvider() {
  const [audioContext, setAudioContext] = useAtom(playerAudioContextAtom);
  const currentTrackFile = useAtomValue(playerQueueCurrentTrackFile);
  const queueIndex = useAtomValue(playerQueueMainIndexAtom);
  const currentManualEntryId = useAtomValue(
    playerCurrentManualQueueEntryIdAtom,
  );
  const shouldPlay = useAtomValue(playerShouldPlayAtom);
  const outputVolume = useAtomValue(playerVolume);
  const [seekRequestMs, setSeekRequestMs] = useAtom(playerSeekRequestAtom);

  const setPlaybackState = useSetAtom(playerPlaybackStateAtom);
  const setPlaybackPosition = useSetAtom(playerPlaybackPositionAtom);
  const setPlaybackDuration = useSetAtom(playerPlaybackDurationAtom);
  const handleNextTrack = useSetAtom(handleNextTrackAtom);

  const audioEl1Ref = useRef<HTMLAudioElement | null>(null);
  const audioEl2Ref = useRef<HTMLAudioElement | null>(null);

  const source1Ref = useRef<MediaElementAudioSourceNode | null>(null);
  const source2Ref = useRef<MediaElementAudioSourceNode | null>(null);
  const gain1Ref = useRef<GainNode | null>(null);
  const gain2Ref = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const ctx = new AudioContext({
      latencyHint: "playback",
    });

    setAudioContext(ctx);

    return () => {
      setAudioContext(null);
      void ctx.close().catch(() => undefined);
    };
  }, [setAudioContext]);

  useEffect(() => {
    const el = audioEl1Ref.current;
    if (!el) return;

    const updatePosition = () => {
      setPlaybackPosition(Math.max(0, Math.floor(el.currentTime * 1000)));
    };

    const updateDuration = () => {
      if (Number.isFinite(el.duration)) {
        setPlaybackDuration(Math.max(0, Math.floor(el.duration * 1000)));
      }
    };

    const handlePlay = () => {
      setPlaybackState("playing");
    };

    const handlePause = () => {
      if (el.ended) {
        return;
      }
      setPlaybackState("paused");
    };

    const handleWaiting = () => {
      setPlaybackState("buffering");
    };

    const handlePlaying = () => {
      setPlaybackState(el.paused ? "paused" : "playing");
    };

    const handleEnded = () => {
      setPlaybackState("paused");
      handleNextTrack();
    };

    updatePosition();
    updateDuration();

    el.addEventListener("timeupdate", updatePosition);
    el.addEventListener("durationchange", updateDuration);
    el.addEventListener("loadedmetadata", updateDuration);
    el.addEventListener("play", handlePlay);
    el.addEventListener("pause", handlePause);
    el.addEventListener("waiting", handleWaiting);
    el.addEventListener("stalled", handleWaiting);
    el.addEventListener("seeking", handleWaiting);
    el.addEventListener("playing", handlePlaying);
    el.addEventListener("canplay", handlePlaying);
    el.addEventListener("ended", handleEnded);

    return () => {
      el.removeEventListener("timeupdate", updatePosition);
      el.removeEventListener("durationchange", updateDuration);
      el.removeEventListener("loadedmetadata", updateDuration);
      el.removeEventListener("play", handlePlay);
      el.removeEventListener("pause", handlePause);
      el.removeEventListener("waiting", handleWaiting);
      el.removeEventListener("stalled", handleWaiting);
      el.removeEventListener("seeking", handleWaiting);
      el.removeEventListener("playing", handlePlaying);
      el.removeEventListener("canplay", handlePlaying);
      el.removeEventListener("ended", handleEnded);
    };
  }, [
    handleNextTrack,
    setPlaybackDuration,
    setPlaybackPosition,
    setPlaybackState,
  ]);

  useEffect(() => {
    if (!audioContext) return;

    const el1 = audioEl1Ref.current;
    const el2 = audioEl2Ref.current;
    if (!el1 || !el2) return;

    if (source1Ref.current && source1Ref.current.context !== audioContext) {
      source1Ref.current = null;
    }
    if (source2Ref.current && source2Ref.current.context !== audioContext) {
      source2Ref.current = null;
    }

    if (gain1Ref.current && gain1Ref.current.context !== audioContext) {
      gain1Ref.current = null;
    }
    if (gain2Ref.current && gain2Ref.current.context !== audioContext) {
      gain2Ref.current = null;
    }
    if (
      masterGainRef.current &&
      masterGainRef.current.context !== audioContext
    ) {
      masterGainRef.current = null;
    }

    if (!source1Ref.current) {
      source1Ref.current = audioContext.createMediaElementSource(el1);
    }
    if (!source2Ref.current) {
      source2Ref.current = audioContext.createMediaElementSource(el2);
    }

    if (!gain1Ref.current) {
      gain1Ref.current = audioContext.createGain();
      gain1Ref.current.gain.value = 1;
    }
    if (!gain2Ref.current) {
      gain2Ref.current = audioContext.createGain();
      gain2Ref.current.gain.value = 1;
    }
    if (!masterGainRef.current) {
      masterGainRef.current = audioContext.createGain();
      masterGainRef.current.gain.value = 1;
      masterGainRef.current.connect(audioContext.destination);
    }

    source1Ref.current.connect(gain1Ref.current);
    gain1Ref.current.connect(masterGainRef.current);

    source2Ref.current.connect(gain2Ref.current);
    gain2Ref.current.connect(masterGainRef.current);

    return () => {
      source1Ref.current?.disconnect();
      source2Ref.current?.disconnect();
      gain1Ref.current?.disconnect();
      gain2Ref.current?.disconnect();
      masterGainRef.current?.disconnect();

      source1Ref.current = null;
      source2Ref.current = null;
      gain1Ref.current = null;
      gain2Ref.current = null;
      masterGainRef.current = null;
    };
  }, [audioContext]);

  useEffect(() => {
    if (!audioContext || !masterGainRef.current) return;

    const normalizedVolume = Math.max(0, Math.min(1, outputVolume / 100));
    masterGainRef.current.gain.setTargetAtTime(
      normalizedVolume,
      audioContext.currentTime,
      0.01,
    );
  }, [audioContext, outputVolume]);

  useEffect(() => {
    const el = audioEl1Ref.current;
    if (!el) return;

    if (!currentTrackFile) {
      el.pause();
      setPlaybackState("idle");
      setPlaybackDuration(0);
      setPlaybackPosition(0);
      return;
    }

    // Reset playback position when track changes
    el.currentTime = 0;
    setPlaybackPosition(0);
  }, [
    currentTrackFile,
    currentManualEntryId,
    queueIndex,
    setPlaybackDuration,
    setPlaybackPosition,
    setPlaybackState,
  ]);

  useEffect(() => {
    const el = audioEl1Ref.current;
    if (!el || !currentTrackFile) return;

    if (!shouldPlay) {
      el.pause();
      setPlaybackState("paused");
      return;
    }

    void (async () => {
      const ctx = audioContext;
      if (!ctx) return;

      if (ctx.state !== "running") {
        await ctx.resume();
      }

      try {
        await el.play();
      } catch {
        setPlaybackState("paused");
      }
    })();
  }, [audioContext, currentTrackFile, setPlaybackState, shouldPlay]);

  useEffect(() => {
    const el = audioEl1Ref.current;
    if (!el) return;

    if (seekRequestMs === null) {
      return;
    }

    const targetSeconds = Math.max(0, seekRequestMs / 1000);
    el.currentTime = targetSeconds;
    setPlaybackPosition(Math.max(0, Math.floor(targetSeconds * 1000)));
    setSeekRequestMs(null);
  }, [seekRequestMs, setPlaybackPosition, setSeekRequestMs]);

  return (
    <section aria-label="Player">
      <audio
        id="oktomusic:player:audio1"
        ref={audioEl1Ref}
        preload="auto"
        crossOrigin="use-credentials"
        src={currentTrackFile || undefined}
      />
      <audio
        id="oktomusic:player:audio2"
        ref={audioEl2Ref}
        preload="auto"
        crossOrigin="use-credentials"
      />
    </section>
  );
}
