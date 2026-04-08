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
      <p className="p-4 text-sm font-semibold text-white/70">Queue</p>
      <ol className="flex flex-1 flex-col gap-6 overflow-auto px-2">
        <li className="flex flex-col">
          <span className="p-2 text-sm font-semibold">Now Playing</span>
          <ol className="flex flex-col">
            {queue[queueIndex] && (
              <QueueTrack
                track={queue[queueIndex]}
                isCurrent={true}
                isPlaying={isPlaying}
                onClickPlay={() => handleTrackClick(queueIndex)}
              />
            )}
          </ol>
        </li>
        <li className="flex flex-col">
          <span className="p-2 text-sm font-semibold">Up Next</span>
          <ol className="flex flex-col">
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
        </li>
        {/*<li className="flex flex-col">
          <div className="flex w-full flex-row justify-between p-2">
            <span className="text-sm font-semibold">Queue from</span>
            <button className="text-sm">Clear queue</button>
          </div>
          <ol className="flex flex-col">
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
        </li>*/}
      </ol>
    </aside>
  );
}
