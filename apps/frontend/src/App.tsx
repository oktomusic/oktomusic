import { CSPProvider } from "@base-ui/react/csp-provider";
import { Toast } from "@base-ui/react/toast";
import { DragDropProvider } from "@dnd-kit/react";
import { useAtomValue } from "jotai";

import {
  panelLeftExpandedAtom,
  panelOverlayVisibleAtom,
  panelRightVisibleAtom,
} from "./atoms/app/panels";
import { DialogCover } from "./components/Dialogs/DialogCover";
import { DialogPlaylistDelete } from "./components/Dialogs/DialogPlaylistDelete";
import { DialogPlaylistEdit } from "./components/Dialogs/DialogPlaylistEdit";
import { HeaderMenu } from "./components/HeaderMenu";
import { OktoDragOverlay } from "./components/OktoDragOverlay";
import { PipControls } from "./components/PipControls/PipControls";
import { AudioSessionProvider } from "./components/Player/AudioSessionProvider";
import { MediaSessionProvider } from "./components/Player/MediaSessionProvider";
import { PlayerControls } from "./components/Player/PlayerControls";
import { PlayerProvider } from "./components/Player/PlayerProvider";
import { useVibrantColorsPlaying } from "./hooks/vibrant_colors";
import { PanelCenter } from "./pages/PanelCenter";
import { PanelLeft } from "./pages/PanelLeft";
import { PanelOverlay } from "./pages/PanelOverlay";
import { PanelRight } from "./pages/PanelRight";
import { PanelToastProvider } from "./pages/PanelToastProvider";

export function App() {
  useVibrantColorsPlaying();

  const leftExpanded = useAtomValue(panelLeftExpandedAtom);
  const rightVisible = useAtomValue(panelRightVisibleAtom);
  const overlayVisible = useAtomValue(panelOverlayVisibleAtom);

  // https://base-ui.com/react/utils/csp-provider

  return (
    <CSPProvider disableStyleElements={true}>
      <Toast.Provider timeout={5000}>
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
          <OktoDragOverlay />
        </DragDropProvider>
      </Toast.Provider>
    </CSPProvider>
  );
}
