import { useAtomValue, useSetAtom } from "jotai";
import { Button } from "@headlessui/react";
import { LuLoaderCircle } from "react-icons/lu";
import { HiXMark } from "react-icons/hi2";

import { playerQueueCurrentTrack } from "../atoms/player/machine";
import { panelOverlayVisibleAtom } from "../atoms/app/panels";
import { OktoScrollArea } from "../components/Base/OktoScrollArea";
import { LyricsViewer } from "../components/LyricsViewer";
import { OktoListbox } from "../components/Base/OktoListbox";
import { usePanelOverlayTranslation } from "../hooks/use_panel_overlay_translation";

export function PanelOverlay() {
  const closeOverlay = useSetAtom(panelOverlayVisibleAtom);
  const currentTrack = useAtomValue(playerQueueCurrentTrack);
  const panelOverlayTranslation = usePanelOverlayTranslation();
  const areLyricsDisplayed =
    currentTrack !== null &&
    currentTrack.hasLyrics !== false &&
    !panelOverlayTranslation.lyricsLoading &&
    panelOverlayTranslation.lyricsError === undefined &&
    panelOverlayTranslation.lyrics.length > 0;

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
        <LyricsViewer
          selectedLanguage={panelOverlayTranslation.language}
          translatedLyrics={panelOverlayTranslation.translatedLyrics}
          lyrics={panelOverlayTranslation.lyrics}
          lyricsLoading={panelOverlayTranslation.lyricsLoading}
          lyricsError={panelOverlayTranslation.lyricsError}
        />
      </OktoScrollArea>

      {panelOverlayTranslation.translatorSupport && areLyricsDisplayed && (
        <div className="absolute right-4 bottom-4 flex flex-row items-center justify-end gap-4">
          {panelOverlayTranslation.showTranslationSpinner && (
            <LuLoaderCircle
              className="size-6 animate-spin text-white/50"
              aria-hidden="true"
            />
          )}
          <OktoListbox
            value={panelOverlayTranslation.language}
            onChange={panelOverlayTranslation.setLanguage}
            options={panelOverlayTranslation.languageOptions}
          />
        </div>
      )}
    </div>
  );
}
