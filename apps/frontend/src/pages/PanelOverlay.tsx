import { useEffect, useId, useRef } from "react";
import { Button } from "@base-ui/react/button";
import { useLingui } from "@lingui/react/macro";
import { useAtomValue, useSetAtom } from "jotai";
import { LuLoaderCircle, LuX } from "react-icons/lu";

import { panelOverlayVisibleAtom } from "../atoms/app/panels";
import { playerQueueCurrentTrack } from "../atoms/player/machine";
import { OktoListbox } from "../components/Base/OktoListbox";
import { OktoScrollArea } from "../components/Base/OktoScrollArea";
import { LyricsViewer } from "../components/LyricsViewer";
import { usePanelOverlayTranslation } from "../hooks/use_panel_overlay_translation";

export function PanelOverlay() {
  const { t } = useLingui();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const closeOverlay = useSetAtom(panelOverlayVisibleAtom);
  const currentTrack = useAtomValue(playerQueueCurrentTrack);
  const panelOverlayTranslation = usePanelOverlayTranslation();
  const areLyricsDisplayed =
    currentTrack !== null &&
    currentTrack.hasLyrics !== false &&
    !panelOverlayTranslation.lyricsLoading &&
    panelOverlayTranslation.lyricsError === undefined &&
    panelOverlayTranslation.lyrics.length > 0;

  useEffect(() => {
    const opener = document.activeElement;
    const panel = panelRef.current;
    closeButtonRef.current?.focus();

    return () => {
      const focusIsInPanel =
        document.activeElement === document.body ||
        panel?.contains(document.activeElement);

      if (
        focusIsInPanel &&
        opener instanceof HTMLElement &&
        opener.isConnected
      ) {
        opener.focus();
      }
    };
  }, []);

  return (
    <div
      id="oktomusic:panel-overlay"
      ref={panelRef}
      className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded"
      role="region"
      aria-labelledby={headingId}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !event.defaultPrevented) {
          event.stopPropagation();
          closeOverlay(false);
        }
      }}
    >
      <h2 id={headingId} className="sr-only">{t`Lyrics`}</h2>
      <Button
        ref={closeButtonRef}
        type="button"
        className="absolute top-4 left-4 z-10 rounded p-2 hover:bg-white/10 focus-visible:outline-offset-2"
        title={t`Close lyrics`}
        aria-label={t`Close lyrics`}
        onClick={() => {
          closeOverlay(false);
        }}
      >
        <LuX className="size-6" />
      </Button>

      <OktoScrollArea className="min-h-0 flex-1">
        <LyricsViewer
          selectedLanguage={panelOverlayTranslation.language}
          sourceLanguage={panelOverlayTranslation.sourceLanguage}
          translatedLyrics={panelOverlayTranslation.translatedLyrics}
          lyrics={panelOverlayTranslation.lyrics}
          lyricsLoading={panelOverlayTranslation.lyricsLoading}
          lyricsError={panelOverlayTranslation.lyricsError}
        />
      </OktoScrollArea>

      {panelOverlayTranslation.translationEnabled && areLyricsDisplayed && (
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
