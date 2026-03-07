import type { RefObject } from "react";
import { useEffect } from "react";
import { useAtomValue } from "jotai";

import {
  playerCurrentTrackColors,
  VibrantColors,
  VibrantColorsPartial,
} from "../atoms/player/machine";
import { applyColorProperties } from "../utils/vibrant_colors";

/**
 * Provide album colors of the playing track as CSS properties to a target document.
 *
 * Note: when rendering into a Document Picture-in-Picture window via a portal,
 * React still runs in the opener context, so the global `document` refers to
 * the opener document, not the PiP window document.
 */
export function useVibrantColorsPlaying(
  targetDocument?: Document | null,
  fallbackColors?: VibrantColorsPartial,
) {
  const colors = useAtomValue(playerCurrentTrackColors);

  useEffect(() => {
    applyColorProperties(
      targetDocument?.documentElement ?? document.documentElement,
      colors ? colors : fallbackColors || {},
    );
  }, [colors, fallbackColors, targetDocument]);
}

/**
 * Provide provided album colors as CSS properties to a target element.
 */
export function useVibrantColors(
  targetRef: RefObject<HTMLElement | null>,
  colors?: VibrantColors,
  fallbackColors?: VibrantColorsPartial,
) {
  useEffect(() => {
    const target = targetRef.current;

    if (!target) {
      return undefined;
    }

    applyColorProperties(target, colors ? colors : fallbackColors || {});

    return () => {
      applyColorProperties(target, {});
    };
  }, [colors, fallbackColors, targetRef]);
}
