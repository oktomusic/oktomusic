import fs from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";

import sharp from "sharp";

import { extractVibrantPalette, formatPaletteForLogging } from "./color/index";

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

async function pickAndConvertAlbumCover(srcPath: string) {
  const candidatePath = await pickAlbumCoverCandidate(srcPath);

  console.log(`Picked album cover candidate: ${candidatePath}`);

  if (!candidatePath) {
    return null;
  }

  const srcImage = sharp(candidatePath);

  // Extract vibrant colors from the source image
  const colorExtractionStart = performance.now();
  const palette = await extractVibrantPalette(srcImage.clone());
  const colorExtractionEnd = performance.now();
  console.log(
    `Color extraction took ${(colorExtractionEnd - colorExtractionStart).toFixed(0)} ms`,
  );
  console.log("Extracted vibrant colors:", formatPaletteForLogging(palette));

  const lossyStart = performance.now();
  await Promise.all(
    albumCoverSizes.map((size) =>
      convertAlbumCoverTo(
        srcImage,
        path.resolve(srcPath, `cover_${size}.avif`),
        size,
      ),
    ),
  );
  const lossyEnd = performance.now();
  console.log(
    `Album cover lossy conversions took ${(lossyEnd - lossyStart).toFixed(0)} ms`,
  );
}

export {
  albumCoverCandidates,
  pickAlbumCoverCandidate,
  albumCoverSizes,
  convertAlbumCoverTo,
  pickAndConvertAlbumCover,
};
