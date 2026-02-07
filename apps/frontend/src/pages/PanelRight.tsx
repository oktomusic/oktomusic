import { useAtomValue } from "jotai";

import { playerQueueAtom } from "../atoms/player/machine";
import { panelRightVisibleAtom } from "../atoms/app/panels";

export function PanelRight() {
  const visible = useAtomValue(panelRightVisibleAtom);
  const queue = useAtomValue(playerQueueAtom);

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
      <div className="flex-1 px-2">
        {queue.map((item) => (
          <div key={item.id} className="py-1 text-sm">
            {item.name}
          </div>
        ))}
      </div>
    </aside>
  );
}
