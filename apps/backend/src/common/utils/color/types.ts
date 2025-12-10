/**
 * Color extraction types for vibrant palette generation.
 * 
 * Based on the node-vibrant library algorithm.
 * Reference: https://github.com/Vibrant-Colors/node-vibrant
 */

/**
 * RGB color representation with values in range [0-255]
 */
export interface RGB {
  readonly r: number
  readonly g: number
  readonly b: number
}

/**
 * HSL color representation
 * - h: hue in range [0-360]
 * - s: saturation in range [0-1]
 * - l: lightness in range [0-1]
 */
export interface HSL {
  readonly h: number
  readonly s: number
  readonly l: number
}

/**
 * A color swatch representing a quantized color from the image
 * with its population (frequency) in the source image
 */
export interface Swatch {
  readonly rgb: RGB
  readonly hsl: HSL
  readonly population: number
}

/**
 * Target values for palette generation.
 * These define the ideal characteristics for each palette type.
 */
export interface PaletteTarget {
  readonly saturationTarget: number
  readonly lightnessTarget: number
  readonly saturationWeight: number
  readonly lightnessWeight: number
  readonly populationWeight: number
}

/**
 * Complete vibrant color palette extracted from an image
 */
export interface VibrantPalette {
  readonly Vibrant: Swatch | null
  readonly LightVibrant: Swatch | null
  readonly DarkVibrant: Swatch | null
  readonly Muted: Swatch | null
  readonly LightMuted: Swatch | null
  readonly DarkMuted: Swatch | null
}

/**
 * Pixel data from a Sharp image buffer
 */
export interface PixelData {
  readonly data: Uint8Array | Uint8ClampedArray
  readonly width: number
  readonly height: number
}
