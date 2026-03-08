import { useSetAtom } from "jotai";
import { Button } from "@headlessui/react";
import { HiXMark } from "react-icons/hi2";

import { panelOverlayVisibleAtom } from "../atoms/app/panels";
import LyricsViewer from "../components/LyricsViewer";

export function PanelOverlay() {
  const closeOverlay = useSetAtom(panelOverlayVisibleAtom);
  return (
    <div
      id="oktomusic:panel-overlay"
      className="flex flex-col gap-4 overflow-y-auto rounded p-4"
      role="region"
    >
      <div>
        <Button
          type="button"
          className="rounded p-2 hover:bg-white/10 focus-visible:outline-offset-2"
          title="Close"
          onClick={() => {
            closeOverlay(false);
          }}
        >
          <HiXMark className="size-6" />
        </Button>
      </div>

      <LyricsViewer />
    </div>
  );
}
