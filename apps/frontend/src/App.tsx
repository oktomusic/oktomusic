import { useAtomValue } from "jotai";

import { useVibrantColorsProperties } from "./hooks/vibrant_colors";
import {
  panelLeftExpandedAtom,
  panelOverlayVisibleAtom,
  panelRightVisibleAtom,
} from "./atoms/app/panels";
import PlayerProvider from "./components/Player/PlayerProvider";
import MediaSessionProvider from "./components/Player/MediaSessionProvider";
import AudioSessionProvider from "./components/Player/AudioSessionProvider";
import { HeaderMenu } from "./components/HeaderMenu";
import PipControls from "./components/PipControls/PipControls";
import { PanelLeft } from "./pages/PanelLeft";
import { PanelOverlay } from "./pages/PanelOverlay";
import { PanelRight } from "./pages/PanelRight";
import PlayerControls from "./components/Player/PlayerControls";
import { PanelCenter } from "./pages/PanelCenter";

export function App() {
  useVibrantColorsProperties();

  const leftExpanded = useAtomValue(panelLeftExpandedAtom);
  const rightVisible = useAtomValue(panelRightVisibleAtom);
  const overlayVisible = useAtomValue(panelOverlayVisibleAtom);

  return (
    <>
      <PlayerProvider />
      <MediaSessionProvider />
      <AudioSessionProvider />
      <HeaderMenu />
      <PipControls />
      <div
        id="oktomusic:content-grid"
        data-left={leftExpanded ? "expanded" : "collapsed"}
        data-right={rightVisible ? "visible" : "hidden"}
      >
        <PanelLeft />
        <PanelCenter />
        {overlayVisible && <PanelOverlay />}
        <PanelRight />
      </div>
      <PlayerControls />
    </>
  );
}
