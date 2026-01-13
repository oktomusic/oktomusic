import { useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";

import {
  playerAudioContextAtom,
  playerQueueCurrentTrackFile,
} from "../../atoms/player/machine";

export default function PlayerProvider() {
  const [audioContext, setAudioContext] = useAtom(playerAudioContextAtom);
  const currentTrackFile = useAtomValue(playerQueueCurrentTrackFile);

  const audioEl1 = useRef<HTMLAudioElement | null>(null);
  const audioEl2 = useRef<HTMLAudioElement | null>(null);

  const source1 = useRef<MediaElementAudioSourceNode | null>(null);
  const source2 = useRef<MediaElementAudioSourceNode | null>(null);
  const gain1 = useRef<GainNode | null>(null);
  const gain2 = useRef<GainNode | null>(null);

  const [isPaused, setIsPaused] = useState(true);

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

    const sync = () => {
      setIsPaused(el.paused);
    };

    // Sync initial state once the element ref is available
    sync();

    el.addEventListener("play", sync);
    el.addEventListener("pause", sync);
    el.addEventListener("ended", sync);

    return () => {
      el.removeEventListener("play", sync);
      el.removeEventListener("pause", sync);
      el.removeEventListener("ended", sync);
    };
  }, []);

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

  return (
    <section aria-label="Player">
      <button
        type="button"
        onClick={() => {
          void (async () => {
            const el = audioEl1.current;
            if (!el) return;

            if (el.paused) {
              const ctx = audioContext;
              if (!ctx) return;

              if (ctx.state !== "running") {
                await ctx.resume();
              }

              await el.play();
            } else {
              el.pause();
            }
          })();
        }}
      >
        {isPaused ? "Play" : "Pause"}
      </button>
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
