import { useSetAtom } from "jotai";
import { HiXMark } from "react-icons/hi2";

import { panelOverlayVisibleAtom } from "../atoms/app/panels";
import LyricsViewer from "../components/LyricsViewer";

export function PanelOverlay() {
  const closeOverlay = useSetAtom(panelOverlayVisibleAtom);
  return (
    <div
      id="oktomusic:panel-overlay"
      className="flex flex-col gap-4 overflow-y-auto rounded bg-purple-950 p-4"
      role="region"
    >
      <div>
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

      <LyricsViewer />
    </div>
  );
}
