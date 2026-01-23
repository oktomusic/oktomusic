import { useEffect } from "react";
import { useAtomValue } from "jotai";

import { playerCurrentTrackColors } from "../atoms/player/machine";
import applyColorProperties from "../utils/vibrant_colors";

/**
 * Provide album color CSS properties to a target document.
 *
 * Note: when rendering into a Document Picture-in-Picture window via a portal,
 * React still runs in the opener context, so the global `document` refers to
 * the opener document, not the PiP window document.
 */
export function useVibrantColorsProperties(targetDocument?: Document | null) {
  const colors = useAtomValue(playerCurrentTrackColors);

  useEffect(() => {
    const doc = targetDocument ?? document;
    applyColorProperties(doc, colors);
  }, [colors, targetDocument]);
}
