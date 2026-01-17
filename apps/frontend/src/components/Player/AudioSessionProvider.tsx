import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import { audioSessionSupportAtom } from "../../atoms/app/browser_support.ts";
import { settingClientAudioSession } from "../../atoms/app/settings_client.ts";
import {
  playerIsPlayingAtom,
  requestPlaybackPauseAtom,
} from "../../atoms/player/machine";

/**
 * Provider for the Audio Session API integration.
 *
 * @see https://github.com/w3c/audio-session/blob/main/explainer.md
 */
export default function AudioSessionProvider() {
  const audioSessionType = useAtomValue(settingClientAudioSession);
  const audioSessionSupported = useAtomValue(audioSessionSupportAtom);
  const isPlaying = useAtomValue(playerIsPlayingAtom);
  const requestPause = useSetAtom(requestPlaybackPauseAtom);

  useEffect(() => {
    if (!audioSessionSupported) {
      return;
    }

    try {
      navigator.audioSession.type = audioSessionType;
    } catch (error) {
      console.error("Failed to set AudioSession type", error);
    }
  }, [audioSessionSupported, audioSessionType]);

  useEffect(() => {
    if (!audioSessionSupported) {
      return;
    }

    const audioSession = navigator.audioSession;
    const handleStateChange = () => {
      if (audioSession.state !== "interrupted") {
        return;
      }

      if (isPlaying) {
        requestPause();
      }
    };

    audioSession.addEventListener("statechange", handleStateChange);
    return () => {
      audioSession.removeEventListener("statechange", handleStateChange);
    };
  }, [audioSessionSupported, isPlaying, requestPause]);

  return null;
}
