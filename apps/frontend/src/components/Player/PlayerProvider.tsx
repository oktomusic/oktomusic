import { useEffect, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import {
  handleNextTrackAtom,
  playerAudioContextAtom,
  playerPlaybackDurationAtom,
  playerPlaybackPositionAtom,
  playerPlaybackStateAtom,
  playerQueueCurrentTrackFile,
  playerSeekRequestAtom,
  playerShouldPlayAtom,
} from "../../atoms/player/machine";

export default function PlayerProvider() {
  const [audioContext, setAudioContext] = useAtom(playerAudioContextAtom);
  const currentTrackFile = useAtomValue(playerQueueCurrentTrackFile);
  const shouldPlay = useAtomValue(playerShouldPlayAtom);
  const [seekRequestMs, setSeekRequestMs] = useAtom(playerSeekRequestAtom);

  const setPlaybackState = useSetAtom(playerPlaybackStateAtom);
  const setPlaybackPosition = useSetAtom(playerPlaybackPositionAtom);
  const setPlaybackDuration = useSetAtom(playerPlaybackDurationAtom);
  const handleNextTrack = useSetAtom(handleNextTrackAtom);

  const audioEl1 = useRef<HTMLAudioElement | null>(null);
  const audioEl2 = useRef<HTMLAudioElement | null>(null);

  const source1 = useRef<MediaElementAudioSourceNode | null>(null);
  const source2 = useRef<MediaElementAudioSourceNode | null>(null);
  const gain1 = useRef<GainNode | null>(null);
  const gain2 = useRef<GainNode | null>(null);

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
    const el = audioEl1.current;
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

    const el1 = audioEl1.current;
    const el2 = audioEl2.current;
    if (!el1 || !el2) return;

    if (source1.current && source1.current.context !== audioContext) {
      source1.current = null;
    }
    if (source2.current && source2.current.context !== audioContext) {
      source2.current = null;
    }

    if (gain1.current && gain1.current.context !== audioContext) {
      gain1.current = null;
    }
    if (gain2.current && gain2.current.context !== audioContext) {
      gain2.current = null;
    }

    if (!source1.current) {
      source1.current = audioContext.createMediaElementSource(el1);
    }
    if (!source2.current) {
      source2.current = audioContext.createMediaElementSource(el2);
    }

    if (!gain1.current) {
      gain1.current = audioContext.createGain();
      gain1.current.gain.value = 1;
    }
    if (!gain2.current) {
      gain2.current = audioContext.createGain();
      gain2.current.gain.value = 1;
    }

    source1.current.connect(gain1.current);
    gain1.current.connect(audioContext.destination);

    source2.current.connect(gain2.current);
    gain2.current.connect(audioContext.destination);

    return () => {
      source1.current?.disconnect();
      source2.current?.disconnect();
      gain1.current?.disconnect();
      gain2.current?.disconnect();

      source1.current = null;
      source2.current = null;
      gain1.current = null;
      gain2.current = null;
    };
  }, [audioContext]);

  useEffect(() => {
    const el = audioEl1.current;
    if (!el) return;

    if (!currentTrackFile) {
      el.pause();
      setPlaybackState("idle");
      setPlaybackDuration(0);
      setPlaybackPosition(0);
      return;
    }

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
  }, [
    audioContext,
    currentTrackFile,
    setPlaybackDuration,
    setPlaybackPosition,
    setPlaybackState,
    shouldPlay,
  ]);

  useEffect(() => {
    const el = audioEl1.current;
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
        ref={audioEl1}
        preload="auto"
        crossOrigin="use-credentials"
        src={currentTrackFile || undefined}
      />
      <audio
        id="oktomusic:player:audio2"
        ref={audioEl2}
        preload="auto"
        crossOrigin="use-credentials"
      />
    </section>
  );
}
