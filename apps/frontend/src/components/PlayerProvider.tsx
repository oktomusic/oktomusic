import { useEffect } from "react";
import { useSetAtom } from "jotai";

import { playerAudioContextAtom } from "../atoms/player/machine";

export default function PlayerProvider() {
  const setAudioContext = useSetAtom(playerAudioContextAtom);

  useEffect(() => {
    const audioContext = new AudioContext({
      latencyHint: "playback",
    });

    setAudioContext(audioContext);
  }, [setAudioContext]);

  return null;
}
