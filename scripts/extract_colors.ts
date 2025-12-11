#!/usr/bin/env tsx

/**
 * Script to extract vibrant colors from an image file.
 *
 * Usage:
 *   tsx scripts/extract_colors.ts <image_path>
 *
 * Note: This script imports from the backend workspace using dynamic imports.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

// Dynamic import for TypeScript files
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
type Swatch = NonNullable<VibrantPalette["Vibrant"]>;

/**
 * Convert hex color to ANSI escape code for background color.
 */
function hexToAnsi(hex: string): string {
  // Remove # if present
  const cleanHex = hex.replace("#", "");

  // Parse RGB values
  const r = Number.parseInt(cleanHex.substring(0, 2), 16);
  const g = Number.parseInt(cleanHex.substring(2, 4), 16);
  const b = Number.parseInt(cleanHex.substring(4, 6), 16);

  // Return ANSI escape code for 24-bit RGB background color
  return `\x1b[48;2;${r};${g};${b}m`;
}

/**
 * Reset ANSI formatting.
 */
const ANSI_RESET = "\x1b[0m";

/**
 * Print a color block with the color name and hex code.
 */
function printColorBlock(name: string, swatch: Swatch | null): void {
  if (!swatch) {
    console.log(`${name.padEnd(15)} (not found)`);
    return;
  }

  const hex = rgbToHex(swatch.rgb);
  const bgColor = hexToAnsi(hex);

  // Calculate luminance to determine if text should be white or black
  const { r, g, b } = swatch.rgb;
  const luminance =
    0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
  const textColor = luminance > 0.5 ? "\x1b[30m" : "\x1b[37m"; // Black or White

  // Create a colored rectangle with text
  const coloredLine = `${bgColor}${textColor}  ${hex}  ${ANSI_RESET}`;

  console.log(`${name.padEnd(15)} ${coloredLine}`);
  console.log(`${"".padEnd(15)} ${bgColor}${" ".repeat(10)}${ANSI_RESET}`);
}

/**
 * Get ordered list of palette entries with their names.
 */
function getPaletteEntries(
  palette: VibrantPalette,
): Array<{ name: string; swatch: Swatch | null }> {
  return [
    { name: "Vibrant", swatch: palette.Vibrant },
    { name: "Light Vibrant", swatch: palette.LightVibrant },
    { name: "Dark Vibrant", swatch: palette.DarkVibrant },
    { name: "Muted", swatch: palette.Muted },
    { name: "Light Muted", swatch: palette.LightMuted },
    { name: "Dark Muted", swatch: palette.DarkMuted },
  ];
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error("Usage: extract_colors.ts <image_path>");
    console.error("");
    console.error("Examples:");
    console.error("  tsx scripts/extract_colors.ts /path/to/cover.jpg");
    console.error("  tsx scripts/extract_colors.ts ./album/cover.png");
    process.exit(1);
  }

  const imagePath = args[0];

  // Check if file exists
  if (!fs.existsSync(imagePath)) {
    console.error(`Error: Image file not found: ${imagePath}`);
    process.exit(2);
  }

  // Check if file is readable
  try {
    await fs.promises.access(imagePath, fs.constants.R_OK);
  } catch {
    console.error(`Error: Cannot read file: ${imagePath}`);
    process.exit(3);
  }

  console.log(`Extracting colors from: ${path.resolve(imagePath)}`);
  console.log("");

  try {
    // Load image with Sharp
    const image = sharp(imagePath);

    // Extract vibrant palette
    const startTime = performance.now();
    const palette = await extractVibrantPalette(image, 64);
    const endTime = performance.now();

    console.log(
      `Color extraction completed in ${Math.round(endTime - startTime)}ms`,
    );
    console.log("");

    // Print colors in order
    const entries = getPaletteEntries(palette);

    for (const { name, swatch } of entries) {
      printColorBlock(name, swatch);
    }

    console.log("");
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error processing image: ${error.message}`);
    } else {
      console.error(`Error processing image: ${String(error)}`);
    }
    process.exit(4);
  }
}

void main();
