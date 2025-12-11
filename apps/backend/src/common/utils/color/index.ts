/**
 * Main vibrant color extraction interface.
 *
 * Extracts a vibrant color palette from image pixel data using the
 * Modified Median Cut Quantization (MMCQ) algorithm.
 *
 * Based on the node-vibrant library algorithm.
 * Reference: https://github.com/Vibrant-Colors/node-vibrant
 */

import type sharp from "sharp";

import { generatePalette } from "./palette";
import { quantize } from "./quantizer";
import type { VibrantPalette, PixelData } from "./types";

/**
 * Extract a vibrant color palette from a Sharp image instance.
 *
 * This function:
 * 1. Extracts raw pixel data from the Sharp instance
 * 2. Quantizes colors using the MMCQ algorithm
 * 3. Generates a palette by selecting the best swatches for each type
 *
 * @param sharpInstance - Sharp image instance to extract colors from
 * @param maxColors - Maximum number of colors to quantize (default: 64)
 * @returns Complete vibrant palette with six color variations
 */
export async function extractVibrantPalette(
  sharpInstance: sharp.Sharp,
  maxColors = 64,
): Promise<VibrantPalette> {
  // Get raw pixel data from Sharp
  // We use raw() to get uncompressed RGB(A) data
  const { data, info } = await sharpInstance
    .ensureAlpha() // Ensure we have an alpha channel
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixelData: PixelData = {
    data,
    width: info.width,
    height: info.height,
  };

  // Quantize colors
  const swatches = quantize(pixelData, maxColors);

  // Generate palette from swatches
  const palette = generatePalette(swatches);

  return palette;
}

/**
 * Format an RGB color as a hex string.
 */
export function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16).padStart(2, "0");
    return hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Format a vibrant palette for logging.
 */
export function formatPaletteForLogging(
  palette: VibrantPalette,
): Record<string, string | null> {
  return {
    Vibrant: palette.Vibrant ? rgbToHex(palette.Vibrant.rgb) : null,
    LightVibrant: palette.LightVibrant
      ? rgbToHex(palette.LightVibrant.rgb)
      : null,
    DarkVibrant: palette.DarkVibrant ? rgbToHex(palette.DarkVibrant.rgb) : null,
    Muted: palette.Muted ? rgbToHex(palette.Muted.rgb) : null,
    LightMuted: palette.LightMuted ? rgbToHex(palette.LightMuted.rgb) : null,
    DarkMuted: palette.DarkMuted ? rgbToHex(palette.DarkMuted.rgb) : null,
  };
}

export type { VibrantPalette, Swatch, RGB, HSL } from "./types";
export { rgbToHsl, hslToRgb, calculateLuminance } from "./color-convert";
