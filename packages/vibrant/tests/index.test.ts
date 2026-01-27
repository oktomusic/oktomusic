import { beforeEach, expect, suite, test, vi } from "vitest";

const processMock = vi.hoisted(() => vi.fn());
const SharpImageMock = vi.hoisted(() => {
  return class SharpImageMock {
    static lastInstance: SharpImageMock | null = null;
    loadedSharp: unknown;
    loadFromSharp = vi.fn((sharpInstance: unknown) => {
      this.loadedSharp = sharpInstance;
      return Promise.resolve(this);
    });
    getImageData = vi.fn(() => ({
      data: new Uint8Array([0]),
      width: 1,
      height: 1,
    }));
    remove = vi.fn();
    constructor() {
      SharpImageMock.lastInstance = this;
    }
  };
});

vi.mock("../src/pipeline.js", () => ({
  pipeline: { process: processMock },
}));

vi.mock("../src/sharp_image.js", () => ({
  SharpImage: SharpImageMock,
}));

import { getPaletteFromSharp } from "../src/index.js";
import { SharpImage } from "../src/sharp_image.js";

type SharpLike = {
  metadata(): Promise<{ width?: number; height?: number }>;
  clone(): { resize: (width: number, height: number) => unknown };
};

type SharpImageClass = typeof SharpImageMock;

const getLastSharpImage = () =>
  (SharpImage as unknown as SharpImageClass).lastInstance;

void suite("getPaletteFromSharp", () => {
  beforeEach(() => {
    processMock.mockReset();
    (SharpImage as unknown as SharpImageClass).lastInstance = null;
  });

  test("resizes image before processing", async () => {
    const resizeMock = vi.fn(() => ({ resized: true }));
    const cloneMock = vi.fn(() => ({ resize: resizeMock }));
    const metadataMock = vi.fn(() =>
      Promise.resolve({ width: 500, height: 200 }),
    );
    const sharpStub: SharpLike = {
      metadata: metadataMock,
      clone: cloneMock,
    };

    processMock.mockResolvedValue({
      colors: [],
      palettes: { default: { Vibrant: null } },
    });

    await getPaletteFromSharp(
      sharpStub as unknown as Parameters<typeof getPaletteFromSharp>[0],
    );

    expect(resizeMock).toHaveBeenCalledWith(100, 40);
    const sharpImage = getLastSharpImage();
    expect(sharpImage?.loadFromSharp).toHaveBeenCalled();
    expect(processMock).toHaveBeenCalled();
    expect(sharpImage?.remove).toHaveBeenCalled();
  });

  test("throws when palette is missing", async () => {
    const sharpStub: SharpLike = {
      metadata: () => Promise.resolve({ width: 10, height: 10 }),
      clone: () => ({ resize: () => ({}) }),
    };

    processMock.mockResolvedValue({
      colors: [],
      palettes: {},
    });

    await expect(
      getPaletteFromSharp(
        sharpStub as unknown as Parameters<typeof getPaletteFromSharp>[0],
      ),
    ).rejects.toThrow("palette was not found");
  });

  test("returns palette from pipeline", async () => {
    const sharpStub: SharpLike = {
      metadata: () => Promise.resolve({ width: 10, height: 10 }),
      clone: () => ({ resize: () => ({}) }),
    };

    const palette = { Vibrant: null };
    processMock.mockResolvedValue({
      colors: [],
      palettes: { default: palette },
    });

    await expect(
      getPaletteFromSharp(
        sharpStub as unknown as Parameters<typeof getPaletteFromSharp>[0],
      ),
    ).resolves.toBe(palette);
  });
});
