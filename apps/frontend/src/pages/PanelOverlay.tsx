import { useSetAtom } from "jotai";
import { HiXMark } from "react-icons/hi2";

import { panelOverlayVisibleAtom } from "../atoms/app/panels";

export function PanelOverlay() {
  const closeOverlay = useSetAtom(panelOverlayVisibleAtom);
  return (
    <div
      id="oktomusic:panel-overlay"
      className="overflow-y-auto rounded bg-purple-950"
      role="region"
    >
      <button
        type="button"
        className="rounded bg-purple-900 p-2 hover:bg-purple-800"
        onClick={() => {
          closeOverlay(false);
        }}
      >
        <HiXMark className="size-6" />
      </button>
    </div>
  );
}
