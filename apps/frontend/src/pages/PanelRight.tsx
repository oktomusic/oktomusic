import { useAtomValue, useSetAtom } from "jotai";

import {
  handleSeekToQueueIndexAtom,
  playerIsPlayingAtom,
  playerQueueAtom,
  playerQueueIndexAtom,
  requestPlaybackToggleAtom,
} from "../atoms/player/machine";
import { panelRightVisibleAtom } from "../atoms/app/panels";
import { QueueTrack } from "../components/QueueTrack/QueueTrack";

export function PanelRight() {
  const visible = useAtomValue(panelRightVisibleAtom);
  const queueIndex = useAtomValue(playerQueueIndexAtom);
  const queue = useAtomValue(playerQueueAtom);
  const isPlaying = useAtomValue(playerIsPlayingAtom);

  const handleSeekToQueueIndex = useSetAtom(handleSeekToQueueIndexAtom);
  const togglePlayback = useSetAtom(requestPlaybackToggleAtom);

  const nextQueue = queue.slice(queueIndex + 1);

  if (!visible) {
    return null;
  }

  const handleTrackClick = (index: number) => {
    if (index === queueIndex) {
      // Current track: toggle play/pause
      togglePlayback();
    } else {
      // Different track: seek to it
      handleSeekToQueueIndex(index);
    }
  };

  return (
    <aside
      id="oktomusic:panel-right"
      className="flex flex-col overflow-hidden rounded bg-zinc-900"
      aria-label="Queue"
    >
      <p className="p-2 text-sm font-semibold text-white/70">Queue</p>
      <ol className="flex-1 overflow-auto px-2">
        {queue[queueIndex] && (
          <QueueTrack
            track={queue[queueIndex]}
            isCurrent={true}
            isPlaying={isPlaying}
            onClickPlay={() => handleTrackClick(queueIndex)}
          />
        )}
        <hr className="my-1 border-zinc-700" />
        {nextQueue.map((item, index) => (
          <QueueTrack
            key={index}
            track={item}
            isCurrent={false}
            isPlaying={false}
            onClickPlay={() => handleTrackClick(queueIndex + index + 1)}
          />
        ))}
      </ol>
    </aside>
  );
}
