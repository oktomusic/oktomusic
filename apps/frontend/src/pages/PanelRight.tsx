import { useAtomValue } from "jotai";

import { playerQueueAtom, playerQueueIndexAtom } from "../atoms/player/machine";
import { panelRightVisibleAtom } from "../atoms/app/panels";
import { QueueTrack } from "../components/QueueTrack/QueueTrack";

export function PanelRight() {
  const visible = useAtomValue(panelRightVisibleAtom);
  const queueIndex = useAtomValue(playerQueueIndexAtom);
  const queue = useAtomValue(playerQueueAtom);

  // const currentTrack = queue[queueIndex];

  const nextQueue = queue.slice(queueIndex + 1);

  if (!visible) {
    return null;
  }

  return (
    <aside
      id="oktomusic:panel-right"
      className="flex flex-col overflow-hidden rounded bg-red-950/40"
      aria-label="Queue"
    >
      <p className="p-2 text-sm font-semibold text-white/70">Queue</p>
      <ol className="flex-1 overflow-auto px-2">
        {nextQueue.map((item, index) => (
          <QueueTrack key={index} track={item} />
        ))}
      </ol>
    </aside>
  );
}
