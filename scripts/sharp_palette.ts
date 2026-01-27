#!/usr/bin/env tsx

import { access } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import { getPaletteFromSharp } from "../packages/vibrant/src/index.js";

type SwatchLike = {
  toJSON(): { rgb: [number, number, number]; population: number };
  hex: string;
  titleTextColor: string;
  bodyTextColor: string;
};

type PaletteLike = Record<string, SwatchLike | null>;

type SerializableSwatch = {
  rgb: [number, number, number];
  population: number;
  hex: string;
  titleTextColor: string;
  bodyTextColor: string;
};

type SerializablePalette = Record<string, SerializableSwatch | null>;

const serializeSwatch = (swatch: SwatchLike): SerializableSwatch => ({
  ...swatch.toJSON(),
  hex: swatch.hex,
  titleTextColor: swatch.titleTextColor,
  bodyTextColor: swatch.bodyTextColor,
});

const serializePalette = (palette: PaletteLike): SerializablePalette => {
  const entries = Object.entries(palette).map(([name, swatch]) => [
    name,
    swatch ? serializeSwatch(swatch) : null,
  ]);

  return Object.fromEntries(entries);
};

const ensureFileExists = async (filePath: string) => {
  try {
    await access(filePath);
  } catch {
    throw new Error(`File not found: ${filePath}`);
  }
};

const parseArgs = () => {
  const [, , filePath] = process.argv;

  if (!filePath) {
    throw new Error("Usage: pnpm tsx scripts/sharp_palette.ts <image-path>");
  }

  return resolve(filePath);
};

const main = async () => {
  const inputPath = parseArgs();
  await ensureFileExists(inputPath);

  const require = createRequire(
    new URL("../packages/vibrant/", import.meta.url),
  );
  const sharpFactory = require("sharp") as (input: string) => unknown;
  const image = sharpFactory(inputPath);
  const palette = (await getPaletteFromSharp(
    image as Parameters<typeof getPaletteFromSharp>[0],
  )) as PaletteLike;
  const output = serializePalette(palette);

  console.log(JSON.stringify(output, null, 2));
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
