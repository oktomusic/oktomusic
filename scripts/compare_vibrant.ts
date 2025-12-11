#!/usr/bin/env tsx

/**
 * Comparison script to verify that our implementation matches node-vibrant.
 *
 * Usage:
 *   tsx scripts/compare_vibrant.ts <image_path>
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";
import { Vibrant } from "node-vibrant/node";

// Dynamic import for our implementation
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const colorModulePath = path.resolve(
  __dirname,
  "../apps/backend/src/common/utils/color/index.ts",
);

const colorUtils = await import(colorModulePath);
const extractVibrantPalette = colorUtils.extractVibrantPalette;
const rgbToHex = colorUtils.rgbToHex;

type VibrantPalette = Awaited<ReturnType<typeof extractVibrantPalette>>;

function formatSwatch(swatch: any): string {
  if (!swatch) return "null";
  return `${rgbToHex(swatch.rgb)} (pop: ${swatch.population}, h: ${swatch.hsl.h.toFixed(1)}, s: ${swatch.hsl.s.toFixed(2)}, l: ${swatch.hsl.l.toFixed(2)})`;
}

function formatNodeVibrantSwatch(swatch: any): string {
  if (!swatch) return "null";
  const [r, g, b] = swatch.rgb;
  const [h, s, l] = swatch.hsl;
  const hex = swatch.hex;
  return `${hex} (pop: ${swatch.population}, h: ${(h * 360).toFixed(1)}, s: ${s.toFixed(2)}, l: ${l.toFixed(2)})`;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error("Usage: compare_vibrant.ts <image_path>");
    process.exit(1);
  }

  const imagePath = args[0];

  if (!fs.existsSync(imagePath)) {
    console.error(`Error: Image file not found: ${imagePath}`);
    process.exit(2);
  }

  console.log(`Comparing color extraction for: ${path.resolve(imagePath)}`);
  console.log("");

  try {
    // Test with node-vibrant
    console.log("=== node-vibrant (reference) ===");
    const vibrantStart = performance.now();
    const nodeVibrantPalette = await Vibrant.from(imagePath).getPalette();
    const vibrantEnd = performance.now();
    console.log(`Time: ${Math.round(vibrantEnd - vibrantStart)}ms`);
    console.log("");
    console.log(
      "Vibrant:      ",
      formatNodeVibrantSwatch(nodeVibrantPalette.Vibrant),
    );
    console.log(
      "LightVibrant: ",
      formatNodeVibrantSwatch(nodeVibrantPalette.LightVibrant),
    );
    console.log(
      "DarkVibrant:  ",
      formatNodeVibrantSwatch(nodeVibrantPalette.DarkVibrant),
    );
    console.log(
      "Muted:        ",
      formatNodeVibrantSwatch(nodeVibrantPalette.Muted),
    );
    console.log(
      "LightMuted:   ",
      formatNodeVibrantSwatch(nodeVibrantPalette.LightMuted),
    );
    console.log(
      "DarkMuted:    ",
      formatNodeVibrantSwatch(nodeVibrantPalette.DarkMuted),
    );
    console.log("");

    // Test with our implementation
    console.log("=== Our Implementation ===");
    const image = sharp(imagePath);
    const ourStart = performance.now();
    const ourPalette = await extractVibrantPalette(image, 64);
    const ourEnd = performance.now();
    console.log(`Time: ${Math.round(ourEnd - ourStart)}ms`);
    console.log("");
    console.log("Vibrant:      ", formatSwatch(ourPalette.Vibrant));
    console.log("LightVibrant: ", formatSwatch(ourPalette.LightVibrant));
    console.log("DarkVibrant:  ", formatSwatch(ourPalette.DarkVibrant));
    console.log("Muted:        ", formatSwatch(ourPalette.Muted));
    console.log("LightMuted:   ", formatSwatch(ourPalette.LightMuted));
    console.log("DarkMuted:    ", formatSwatch(ourPalette.DarkMuted));
    console.log("");

    // Compare results
    console.log("=== Comparison ===");
    const paletteKeys = [
      "Vibrant",
      "LightVibrant",
      "DarkVibrant",
      "Muted",
      "LightMuted",
      "DarkMuted",
    ] as const;
    let matchCount = 0;
    let totalWithValues = 0;

    for (const key of paletteKeys) {
      const nodeVal = nodeVibrantPalette[key];
      const ourVal = ourPalette[key];

      if (nodeVal || ourVal) {
        totalWithValues++;

        if (nodeVal && ourVal) {
          const nodeHex = nodeVal.hex;
          const ourHex = rgbToHex(ourVal.rgb);

          if (nodeHex === ourHex) {
            console.log(`✓ ${key}: MATCH (${nodeHex})`);
            matchCount++;
          } else {
            console.log(
              `✗ ${key}: DIFF (node-vibrant: ${nodeHex}, ours: ${ourHex})`,
            );
          }
        } else if (nodeVal && !ourVal) {
          const nodeHex = nodeVal.hex;
          console.log(`✗ ${key}: node-vibrant has ${nodeHex}, ours is null`);
        } else {
          const ourHex = rgbToHex(ourVal.rgb);
          console.log(`✗ ${key}: node-vibrant is null, ours has ${ourHex}`);
        }
      }
    }

    console.log("");
    console.log(
      `Match rate: ${matchCount}/${totalWithValues} (${Math.round((matchCount / totalWithValues) * 100)}%)`,
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error(`Error: ${String(error)}`);
    }
    process.exit(4);
  }
}

void main();
