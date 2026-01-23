import { useEffect } from "react";
import { useAtomValue } from "jotai";

import { playerCurrentTrackColors } from "../atoms/player/machine";
import applyColorProperties from "../utils/vibrant_colors";

/**
 * Provide album color CSS properties to current document
 */
export function useVibrantColorsProperties() {
  const colors = useAtomValue(playerCurrentTrackColors);

  useEffect(() => {
    applyColorProperties(document, colors);
  }, [colors]);
}
