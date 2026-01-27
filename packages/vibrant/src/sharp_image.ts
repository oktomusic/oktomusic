/* eslint-disable @typescript-eslint/no-unused-vars */
import { ImageBase, type ImageData, type ImageSource } from "@vibrant/image";
import type sharp from "sharp";

/**
 * Internal Image class implementation using sharp.
 * This class wraps a sharp.Sharp object and implements the ImageBase interface
 * required by the vibrant pipeline.
 */
export class SharpImage extends ImageBase {
  private _width = 0;
  private _height = 0;
  private _data: Buffer | undefined;

  private _getImageData() {
    if (!this._data) {
      throw new Error("Image not loaded");
    }
    return this._data;
  }

  /**
   * Load is not supported for SharpImage - use loadFromSharp instead.
   * This method exists only to satisfy the ImageBase interface.
   */
  load(_image: ImageSource): Promise<ImageBase> {
    return Promise.reject(
      new Error(
        "SharpImage does not support load(). Use getPaletteFromSharp() instead.",
      ),
    );
  }

  /**
   * Load image data from a sharp.Sharp object.
   * Converts the image to raw RGBA pixel data.
   */
  async loadFromSharp(sharpInstance: sharp.Sharp): Promise<SharpImage> {
    // Ensure we get raw RGBA data
    const { data, info } = await sharpInstance
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    this._width = info.width;
    this._height = info.height;
    this._data = data;

    return this;
  }

  clear(): void {}

  update(_imageData: ImageData): void {}

  getWidth(): number {
    return this._width;
  }

  getHeight(): number {
    return this._height;
  }

  resize(_targetWidth: number, _targetHeight: number, _ratio: number): void {
    // For sharp, resize is a no-op since we handle it differently
    // The image is already loaded at this point, but we can update dimensions
    // if needed. In practice, the scaleDown is handled by the Vibrant class
    // before calling getImageData.
  }

  getPixelCount(): number {
    return this._width * this._height;
  }

  getImageData(): ImageData {
    return {
      data: this._getImageData(),
      width: this._width,
      height: this._height,
    };
  }

  remove(): void {}
}
