/**
 * Palette generation from quantized color swatches.
 *
 * Selects the best swatches for Vibrant, Muted, Light, and Dark variations
 * based on target characteristics and scoring functions.
 *
 * Based on the node-vibrant library algorithm.
 * Reference: https://github.com/Vibrant-Colors/node-vibrant
 */

import type { Swatch, VibrantPalette, PaletteTarget } from "./types";

/**
 * Default target values for palette generation.
 * These define ideal characteristics for each palette type.
 */
const TARGETS = {
  VIBRANT: {
    saturationTarget: 1.0,
    lightnessTarget: 0.5,
    saturationWeight: 1.0,
    lightnessWeight: 1.0,
    populationWeight: 1.0,
  },
  LIGHT_VIBRANT: {
    saturationTarget: 1.0,
    lightnessTarget: 0.74,
    saturationWeight: 1.0,
    lightnessWeight: 1.0,
    populationWeight: 1.0,
  },
  DARK_VIBRANT: {
    saturationTarget: 1.0,
    lightnessTarget: 0.26,
    saturationWeight: 1.0,
    lightnessWeight: 1.0,
    populationWeight: 1.0,
  },
  MUTED: {
    saturationTarget: 0.3,
    lightnessTarget: 0.5,
    saturationWeight: 1.0,
    lightnessWeight: 1.0,
    populationWeight: 1.0,
  },
  LIGHT_MUTED: {
    saturationTarget: 0.3,
    lightnessTarget: 0.74,
    saturationWeight: 1.0,
    lightnessWeight: 1.0,
    populationWeight: 1.0,
  },
  DARK_MUTED: {
    saturationTarget: 0.3,
    lightnessTarget: 0.26,
    saturationWeight: 1.0,
    lightnessWeight: 1.0,
    populationWeight: 1.0,
  },
} as const;

/**
 * Minimum saturation threshold for vibrant colors.
 */
const MIN_VIBRANT_SATURATION = 0.35;

/**
 * Minimum saturation threshold for muted colors.
 */
const MAX_MUTED_SATURATION = 0.4;

/**
 * Lightness range for dark colors.
 */
const MAX_DARK_LIGHTNESS = 0.4;

/**
 * Lightness range for light colors.
 */
const MIN_LIGHT_LIGHTNESS = 0.55;

/**
 * Calculate a weighted score for a swatch based on target values.
 * Higher scores indicate a better match for the target.
 */
function scoreSwatchForTarget(
  swatch: Swatch,
  target: PaletteTarget,
  maxPopulation: number,
): number {
  const saturationDiff = Math.abs(swatch.hsl.s - target.saturationTarget);
  const lightnessDiff = Math.abs(swatch.hsl.l - target.lightnessTarget);
  const populationRatio =
    maxPopulation > 0 ? swatch.population / maxPopulation : 0;

  // Weighted score calculation
  const saturationScore = 1 - saturationDiff;
  const lightnessScore = 1 - lightnessDiff;

  const score =
    saturationScore * target.saturationWeight +
    lightnessScore * target.lightnessWeight +
    populationRatio * target.populationWeight;

  return score;
}

/**
 * Find the best matching swatch for a specific palette target.
 */
function findBestSwatch(
  swatches: Swatch[],
  target: PaletteTarget,
  maxPopulation: number,
  filter?: (swatch: Swatch) => boolean,
): Swatch | null {
  let bestSwatch: Swatch | null = null;
  let bestScore = 0;

  for (const swatch of swatches) {
    // Apply filter if provided
    if (filter && !filter(swatch)) {
      continue;
    }

    const score = scoreSwatchForTarget(swatch, target, maxPopulation);
    if (score > bestScore) {
      bestScore = score;
      bestSwatch = swatch;
    }
  }

  return bestSwatch;
}

/**
 * Check if a swatch meets the criteria for vibrant colors.
 */
function isVibrant(swatch: Swatch): boolean {
  return swatch.hsl.s >= MIN_VIBRANT_SATURATION;
}

/**
 * Check if a swatch meets the criteria for muted colors.
 */
function isMuted(swatch: Swatch): boolean {
  return swatch.hsl.s <= MAX_MUTED_SATURATION;
}

/**
 * Check if a swatch meets the criteria for dark colors.
 */
function isDark(swatch: Swatch): boolean {
  return swatch.hsl.l <= MAX_DARK_LIGHTNESS;
}

/**
 * Check if a swatch meets the criteria for light colors.
 */
function isLight(swatch: Swatch): boolean {
  return swatch.hsl.l >= MIN_LIGHT_LIGHTNESS;
}

/**
 * Generate a complete vibrant color palette from an array of swatches.
 *
 * This function selects the best matching swatches for each palette type:
 * - Vibrant: High saturation, medium lightness
 * - Light Vibrant: High saturation, high lightness
 * - Dark Vibrant: High saturation, low lightness
 * - Muted: Low saturation, medium lightness
 * - Light Muted: Low saturation, high lightness
 * - Dark Muted: Low saturation, low lightness
 *
 * @param swatches - Array of color swatches from quantization
 * @returns Complete vibrant palette with all six color variations
 */
export function generatePalette(swatches: Swatch[]): VibrantPalette {
  if (swatches.length === 0) {
    return {
      Vibrant: null,
      LightVibrant: null,
      DarkVibrant: null,
      Muted: null,
      LightMuted: null,
      DarkMuted: null,
    };
  }

  // Find max population for scoring
  const maxPopulation = Math.max(...swatches.map((s) => s.population));

  // Generate each palette entry
  const vibrant = findBestSwatch(
    swatches,
    TARGETS.VIBRANT,
    maxPopulation,
    isVibrant,
  );

  const lightVibrant = findBestSwatch(
    swatches,
    TARGETS.LIGHT_VIBRANT,
    maxPopulation,
    (s) => isVibrant(s) && isLight(s),
  );

  const darkVibrant = findBestSwatch(
    swatches,
    TARGETS.DARK_VIBRANT,
    maxPopulation,
    (s) => isVibrant(s) && isDark(s),
  );

  const muted = findBestSwatch(swatches, TARGETS.MUTED, maxPopulation, isMuted);

  const lightMuted = findBestSwatch(
    swatches,
    TARGETS.LIGHT_MUTED,
    maxPopulation,
    (s) => isMuted(s) && isLight(s),
  );

  const darkMuted = findBestSwatch(
    swatches,
    TARGETS.DARK_MUTED,
    maxPopulation,
    (s) => isMuted(s) && isDark(s),
  );

  return {
    Vibrant: vibrant,
    LightVibrant: lightVibrant,
    DarkVibrant: darkVibrant,
    Muted: muted,
    LightMuted: lightMuted,
    DarkMuted: darkMuted,
  };
}
