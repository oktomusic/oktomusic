import { useEffect, useState } from "react";
import "./WindowControls.css";

// https://web.dev/articles/window-controls-overlay

function getOverlayVisibility(): boolean {
  return window.navigator.windowControlsOverlay?.visible ?? false;
}

export default function WindowControls() {
  const [isCustomEnabled, setIsCustomEnabled] = useState<boolean>(() => {
    return getOverlayVisibility();
  });

  useEffect(() => {
    if (!window.navigator.windowControlsOverlay) {
      return;
    }

    function handleVisibilityChange() {
      setIsCustomEnabled(getOverlayVisibility());
    }

    window.navigator.windowControlsOverlay.addEventListener(
      "geometrychange",
      handleVisibilityChange,
    );

    return () => {
      if (!window.navigator.windowControlsOverlay) {
        return;
      }
      window.navigator.windowControlsOverlay.removeEventListener(
        "geometrychange",
        handleVisibilityChange,
      );
    };
  });

  return isCustomEnabled ? (
    <div id="pwa-window-controls">
      <h1>Oktomusic</h1>
    </div>
  ) : undefined;
}
