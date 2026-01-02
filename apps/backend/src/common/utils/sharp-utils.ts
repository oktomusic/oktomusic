import fs from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";

import sharp from "sharp";

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
  candidatePath: string,
  outputDir: string,
): Promise<void> {
  await fs.mkdir(outputDir, { recursive: true });

  const srcImage = sharp(candidatePath);
  // Ensure the file is a valid image.
  await srcImage.metadata();

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
}

async function pickAndConvertAlbumCover(
  srcPath: string,
  outputDir: string,
): Promise<AlbumCoverCandidatePath | null> {
  const candidatePath = await pickAlbumCoverCandidate(srcPath);

  console.log(`Picked album cover candidate: ${candidatePath}`);

  if (!candidatePath) {
    return null;
  }

  await convertAlbumCoverCandidate(candidatePath, outputDir);
  return candidatePath;
}

export {
  albumCoverCandidates,
  pickAlbumCoverCandidate,
  albumCoverSizes,
  convertAlbumCoverTo,
  convertAlbumCoverCandidate,
  pickAndConvertAlbumCover,
};

export type { AlbumCoverSize, AlbumCoverSizeString };
