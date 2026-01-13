import { useEffect, useRef } from "react";
import { useSetAtom } from "jotai";

import { playerAudioContextAtom } from "../atoms/player/machine";

export default function PlayerProvider() {
  const setAudioContext = useSetAtom(playerAudioContextAtom);

  const audioSource1 = useRef<HTMLAudioElement>(null);
  const audioSource2 = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audioContext = new AudioContext({
      latencyHint: "playback",
    });

    setAudioContext(audioContext);
  }, [setAudioContext]);

  return (
    <>
      <audio ref={audioSource1} preload="metadata" />
      <audio ref={audioSource2} preload="metadata" />
    </>
  );
}
