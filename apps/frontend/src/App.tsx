import { useAtomValue } from "jotai";
import { DragDropProvider } from "@dnd-kit/react";
import { CSPProvider } from "@base-ui/react/csp-provider";

import { useVibrantColorsPlaying } from "./hooks/vibrant_colors";
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
import { DialogCover } from "./components/Dialogs/DialogCover";
import { DialogPlaylistDelete } from "./components/Dialogs/DialogPlaylistDelete";
import { DialogPlaylistEdit } from "./components/Dialogs/DialogPlaylistEdit";
import { PanelLeft } from "./pages/PanelLeft";
import { PanelOverlay } from "./pages/PanelOverlay";
import { PanelRight } from "./pages/PanelRight";
import PlayerControls from "./components/Player/PlayerControls";
import { PanelCenter } from "./pages/PanelCenter";
import { PanelToastProvider } from "./pages/PanelToastProvider";

export function App() {
  useVibrantColorsPlaying();

  const leftExpanded = useAtomValue(panelLeftExpandedAtom);
  const rightVisible = useAtomValue(panelRightVisibleAtom);
  const overlayVisible = useAtomValue(panelOverlayVisibleAtom);

  // https://base-ui.com/react/utils/csp-provider

  return (
    <CSPProvider disableStyleElements={true}>
      <DragDropProvider>
        <PlayerProvider />
        <MediaSessionProvider />
        <AudioSessionProvider />
        <HeaderMenu />
        <PipControls />
        <DialogCover />
        <DialogPlaylistDelete />
        <DialogPlaylistEdit />
        <div
          id="oktomusic:content-grid"
          data-left={leftExpanded ? "expanded" : "collapsed"}
          data-right={rightVisible ? "visible" : "hidden"}
        >
          <PanelLeft />
          <PanelCenter />
          {overlayVisible && <PanelOverlay />}
          <PanelToastProvider />
          <PanelRight />
        </div>
        <PlayerControls />
      </DragDropProvider>
    </CSPProvider>
  );
}
