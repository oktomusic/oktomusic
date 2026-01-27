import type { Palette } from "@vibrant/color";
import type sharp from "sharp";

import { SharpImage } from "./sharp_image";
import { pipeline } from "./pipeline";

export async function getPaletteFromSharp(img: sharp.Sharp): Promise<Palette> {
  // Get image metadata to determine original dimensions
  const metadata = await img.metadata();
  const originalWidth = metadata.width ?? 0;
  const originalHeight = metadata.height ?? 0;

  // Apply the same scaling logic as the default Vibrant options
  // Default quality is 5, meaning we scale down by factor of 5
  const quality = 5;
  const ratio = 1 / quality;

  const targetWidth = Math.max(1, Math.floor(originalWidth * ratio));
  const targetHeight = Math.max(1, Math.floor(originalHeight * ratio));

  // Clone the sharp instance and resize it before extracting raw data
  const resizedSharp = img.clone().resize(targetWidth, targetHeight);

  // Load the image into our SharpImage wrapper
  const image = new SharpImage();
  await image.loadFromSharp(resizedSharp);

  // Process the image through the vibrant pipeline
  const imageData = image.getImageData();
  const result = await pipeline.process(imageData, {
    quantizer: {
      name: "mmcq",
      options: {
        colorCount: 64, // Vibrant.DefaultOpts.colorCount
      },
    },
    generators: ["default"],
    filters: ["default"],
  });

  const palette = result.palettes["default"];
  if (!palette) {
    throw new Error("Something went wrong and a palette was not found");
  }

  image.remove();

  return palette;
}
