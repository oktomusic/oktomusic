import fs from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";

import sharp from "sharp";

import { getPaletteFromSharp } from "@oktomusic/vibrant";

/**
 * Vibrant color palette extracted from an album cover.
 * All values are hex strings, e.g. "#RRGGBB".
 */
interface AlbumCoverColors {
  readonly vibrant: string;
  readonly darkVibrant: string;
  readonly lightVibrant: string;
  readonly muted: string;
  readonly darkMuted: string;
  readonly lightMuted: string;
}

/**
 * Result of processing an album cover image.
 * Contains the extracted vibrant color palette.
 */
interface AlbumCoverProcessingResult {
  readonly colors: AlbumCoverColors;
}

/**
 * Extract vibrant colors from a sharp image instance.
 *
 * @param srcImage - Sharp image instance to extract colors from
 * @returns AlbumCoverColors with all 6 vibrant color values as hex strings
 * @throws Error if any required color cannot be extracted
 */
async function extractAlbumCoverColors(
  srcImage: sharp.Sharp,
): Promise<AlbumCoverColors> {
  const palette = await getPaletteFromSharp(srcImage);

  const vibrant = palette.Vibrant?.hex;
  const darkVibrant = palette.DarkVibrant?.hex;
  const lightVibrant = palette.LightVibrant?.hex;
  const muted = palette.Muted?.hex;
  const darkMuted = palette.DarkMuted?.hex;
  const lightMuted = palette.LightMuted?.hex;

  if (
    vibrant === undefined ||
    darkVibrant === undefined ||
    lightVibrant === undefined ||
    muted === undefined ||
    darkMuted === undefined ||
    lightMuted === undefined
  ) {
    const missing: string[] = [];
    if (vibrant === undefined) missing.push("Vibrant");
    if (darkVibrant === undefined) missing.push("DarkVibrant");
    if (lightVibrant === undefined) missing.push("LightVibrant");
    if (muted === undefined) missing.push("Muted");
    if (darkMuted === undefined) missing.push("DarkMuted");
    if (lightMuted === undefined) missing.push("LightMuted");
    throw new Error(
      `Failed to extract all required colors from album cover. Missing: ${missing.join(", ")}`,
    );
  }

  return {
    vibrant,
    darkVibrant,
    lightVibrant,
    muted,
    darkMuted,
    lightMuted,
  };
}

const albumCoverCandidates = [
  "cover.png",
  "cover.avif",
  "cover.jpg",
  "cover.jpeg",
] as const;

type AlbumCoverCandidatePath =
  `${string}/${(typeof albumCoverCandidates)[number]}`;

async function pickAlbumCoverCandidate(
  srcPath: string,
): Promise<AlbumCoverCandidatePath | null> {
  for (const candidate of albumCoverCandidates) {
    const candidatePath = path.resolve(srcPath, candidate);
    try {
      const stat = await fs.stat(candidatePath);
      await fs.access(candidatePath, fs.constants.R_OK);
      if (stat.isFile()) {
        return candidatePath as AlbumCoverCandidatePath;
      }
    } catch {
      // File does not exist, continue to next candidate
    }
  }
  return null;
}

// https://developer.mozilla.org/en-US/docs/Web/API/MediaMetadata/artwork
const albumCoverSizes = [96, 128, 192, 256, 384, 512, 1280] as const;

type AlbumCoverSize = (typeof albumCoverSizes)[number];
type AlbumCoverSizeString = `${AlbumCoverSize}`;

const albumCoverConversionParams = {
  quality: 60, // 0–100 but usually 30–60 is best
  effort: 4, // 0–9 encoding effort (higher = slower)
  chromaSubsampling: "4:4:4", // best quality
} as const;

/**
 * Convert album cover image to AVIF in specified size.
 */
async function convertAlbumCoverTo(
  srcImage: sharp.Sharp,
  outputPath: string,
  size: (typeof albumCoverSizes)[number],
  lossless: boolean = false,
) {
  await srcImage
    .clone()
    .resize({ height: size, width: size, fit: sharp.fit.cover })
    .avif({
      lossless: lossless ? true : undefined,
      quality: lossless ? undefined : albumCoverConversionParams.quality,
      effort: albumCoverConversionParams.effort,
      chromaSubsampling: albumCoverConversionParams.chromaSubsampling,
    })
    .toFile(outputPath);
}

async function convertAlbumCoverCandidate(
  srcImage: sharp.Sharp,
  outputDir: string,
): Promise<AlbumCoverProcessingResult> {
  await fs.mkdir(outputDir, { recursive: true });

  // Extract vibrant colors and generate AVIF variants in parallel
  const [colors] = await Promise.all([
    extractAlbumCoverColors(srcImage),
    (async () => {
      const lossyStart = performance.now();
      await Promise.all(
        albumCoverSizes.map((size) =>
          convertAlbumCoverTo(
            srcImage,
            path.resolve(outputDir, `cover_${size}.avif`),
            size,
          ),
        ),
      );
      const lossyEnd = performance.now();
      console.log(
        `Album cover lossy conversions took ${(lossyEnd - lossyStart).toFixed(0)} ms`,
      );
    })(),
  ]);

  return { colors };
}

async function pickAndConvertAlbumCover(
  srcPath: string,
  outputDir: string,
): Promise<{
  candidatePath: AlbumCoverCandidatePath;
  result: AlbumCoverProcessingResult;
} | null> {
  const candidatePath = await pickAlbumCoverCandidate(srcPath);

  console.log(`Picked album cover candidate: ${candidatePath}`);

  if (!candidatePath) {
    return null;
  }

  const srcImage = sharp(candidatePath);
  // Ensure the file is a valid image.
  await srcImage.metadata();

  const result = await convertAlbumCoverCandidate(srcImage, outputDir);
  return { candidatePath, result };
}

export {
  albumCoverCandidates,
  pickAlbumCoverCandidate,
  albumCoverSizes,
  convertAlbumCoverTo,
  convertAlbumCoverCandidate,
  extractAlbumCoverColors,
  pickAndConvertAlbumCover,
};

export type {
  AlbumCoverColors,
  AlbumCoverProcessingResult,
  AlbumCoverSize,
  AlbumCoverSizeString,
};
