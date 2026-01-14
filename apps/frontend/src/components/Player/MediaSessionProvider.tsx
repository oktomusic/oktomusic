import { useEffect } from "react";
import { useAtomValue } from "jotai";

import { playerQueueCurrentTrack } from "../../atoms/player/machine";
import { buildMediaMetadata } from "../../utils/media_metadata";

/**
 * Provider for the [Media Session API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API) integration.
 *
 * @see https://web.dev/articles/media-session
 */
export default function MediaSessionProvider() {
  const currentTrack = useAtomValue(playerQueueCurrentTrack);

  // mediaSession is a required API, we already check for its presence in browser support atom
  // TODO: add action handlers for play/pause/seek/skip when we have playback control implemented

  useEffect(() => {
    if (!currentTrack) {
      navigator.mediaSession.metadata = null;
      return;
    }

    navigator.mediaSession.metadata = buildMediaMetadata(currentTrack);
  }, [currentTrack]);

  return null;
}
