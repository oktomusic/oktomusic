import { describe, it, expect } from "vitest";
import sharp from "sharp";

import { extractVibrantPalette, rgbToHex } from "./index";

describe("extractVibrantPalette integration", () => {
  it("extracts colors from a simple red gradient image", async () => {
    // Create a 100x100 red gradient image
    const width = 100;
    const height = 100;
    const channels = 4; // RGBA

    const buffer = Buffer.alloc(width * height * channels);

    // Fill with red gradient (top = dark, bottom = bright)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        const intensity = Math.floor((y / height) * 255);
        buffer[idx] = intensity; // R
        buffer[idx + 1] = 0; // G
        buffer[idx + 2] = 0; // B
        buffer[idx + 3] = 255; // A
      }
    }

    const image = sharp(buffer, {
      raw: {
        width,
        height,
        channels,
      },
    });

    const palette = await extractVibrantPalette(image, 16);

    // Should extract some red-based colors
    expect(palette).toBeDefined();

    // At least one palette entry should be extracted
    const hasColors =
      palette.Vibrant !== null ||
      palette.DarkVibrant !== null ||
      palette.LightVibrant !== null ||
      palette.Muted !== null ||
      palette.DarkMuted !== null ||
      palette.LightMuted !== null;

    expect(hasColors).toBe(true);

    // Log the extracted colors for manual verification
    if (palette.Vibrant) {
      console.log("Vibrant:", rgbToHex(palette.Vibrant.rgb));
    }
    if (palette.DarkVibrant) {
      console.log("DarkVibrant:", rgbToHex(palette.DarkVibrant.rgb));
    }
    if (palette.LightVibrant) {
      console.log("LightVibrant:", rgbToHex(palette.LightVibrant.rgb));
    }
  });

  it("extracts colors from a multi-color image", async () => {
    // Create a 100x100 image with multiple colors
    const width = 100;
    const height = 100;
    const channels = 4; // RGBA

    const buffer = Buffer.alloc(width * height * channels);

    // Fill with a pattern: red quadrant, green quadrant, blue quadrant, yellow quadrant
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;

        if (x < width / 2 && y < height / 2) {
          // Top-left: Red
          buffer[idx] = 255;
          buffer[idx + 1] = 0;
          buffer[idx + 2] = 0;
        } else if (x >= width / 2 && y < height / 2) {
          // Top-right: Green
          buffer[idx] = 0;
          buffer[idx + 1] = 255;
          buffer[idx + 2] = 0;
        } else if (x < width / 2 && y >= height / 2) {
          // Bottom-left: Blue
          buffer[idx] = 0;
          buffer[idx + 1] = 0;
          buffer[idx + 2] = 255;
        } else {
          // Bottom-right: Yellow
          buffer[idx] = 255;
          buffer[idx + 1] = 255;
          buffer[idx + 2] = 0;
        }
        buffer[idx + 3] = 255; // A
      }
    }

    const image = sharp(buffer, {
      raw: {
        width,
        height,
        channels,
      },
    });

    const palette = await extractVibrantPalette(image, 32);

    // Should extract at least some colors
    const hasColors =
      palette.Vibrant !== null ||
      palette.DarkVibrant !== null ||
      palette.LightVibrant !== null ||
      palette.Muted !== null ||
      palette.DarkMuted !== null ||
      palette.LightMuted !== null;

    expect(hasColors).toBe(true);

    // Log the extracted colors for manual verification
    console.log("Multi-color palette:");
    if (palette.Vibrant) {
      console.log("  Vibrant:", rgbToHex(palette.Vibrant.rgb));
    }
    if (palette.LightVibrant) {
      console.log("  LightVibrant:", rgbToHex(palette.LightVibrant.rgb));
    }
    if (palette.DarkVibrant) {
      console.log("  DarkVibrant:", rgbToHex(palette.DarkVibrant.rgb));
    }
    if (palette.Muted) {
      console.log("  Muted:", rgbToHex(palette.Muted.rgb));
    }
    if (palette.LightMuted) {
      console.log("  LightMuted:", rgbToHex(palette.LightMuted.rgb));
    }
    if (palette.DarkMuted) {
      console.log("  DarkMuted:", rgbToHex(palette.DarkMuted.rgb));
    }
  });

  it("handles grayscale images", async () => {
    // Create a 100x100 grayscale gradient
    const width = 100;
    const height = 100;
    const channels = 4; // RGBA

    const buffer = Buffer.alloc(width * height * channels);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        const gray = Math.floor((y / height) * 255);
        buffer[idx] = gray; // R
        buffer[idx + 1] = gray; // G
        buffer[idx + 2] = gray; // B
        buffer[idx + 3] = 255; // A
      }
    }

    const image = sharp(buffer, {
      raw: {
        width,
        height,
        channels,
      },
    });

    const palette = await extractVibrantPalette(image, 16);

    // Grayscale images might have muted colors
    expect(palette).toBeDefined();

    // Log results
    console.log("Grayscale palette extracted");
  });
});
