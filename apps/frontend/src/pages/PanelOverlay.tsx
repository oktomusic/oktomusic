import { useSetAtom } from "jotai";
import { Button } from "@headlessui/react";
import { HiXMark } from "react-icons/hi2";

import { panelOverlayVisibleAtom } from "../atoms/app/panels";
import { OktoScrollArea } from "../components/Base/OktoScrollArea";
import { LyricsViewer } from "../components/LyricsViewer";

export function PanelOverlay() {
  const closeOverlay = useSetAtom(panelOverlayVisibleAtom);
  return (
    <div
      id="oktomusic:panel-overlay"
      className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded"
      role="region"
    >
      <Button
        type="button"
        className="absolute top-4 left-4 z-10 rounded p-2 hover:bg-white/10 focus-visible:outline-offset-2"
        title="Close"
        onClick={() => {
          closeOverlay(false);
        }}
      >
        <HiXMark className="size-6" />
      </Button>

      <OktoScrollArea className="min-h-0 flex-1">
        <LyricsViewer />
      </OktoScrollArea>
    </div>
  );
}
