import { describe, it, expect } from "vitest"

import { rgbToHsl, hslToRgb, calculateLuminance } from "./color-convert"
import type { RGB, HSL } from "./types"

describe("rgbToHsl", () => {
  it("converts pure red to HSL", () => {
    const rgb: RGB = { r: 255, g: 0, b: 0 }
    const hsl = rgbToHsl(rgb)
    expect(hsl.h).toBeCloseTo(0, 1)
    expect(hsl.s).toBeCloseTo(1, 1)
    expect(hsl.l).toBeCloseTo(0.5, 1)
  })

  it("converts pure green to HSL", () => {
    const rgb: RGB = { r: 0, g: 255, b: 0 }
    const hsl = rgbToHsl(rgb)
    expect(hsl.h).toBeCloseTo(120, 1)
    expect(hsl.s).toBeCloseTo(1, 1)
    expect(hsl.l).toBeCloseTo(0.5, 1)
  })

  it("converts pure blue to HSL", () => {
    const rgb: RGB = { r: 0, g: 0, b: 255 }
    const hsl = rgbToHsl(rgb)
    expect(hsl.h).toBeCloseTo(240, 1)
    expect(hsl.s).toBeCloseTo(1, 1)
    expect(hsl.l).toBeCloseTo(0.5, 1)
  })

  it("converts white to HSL", () => {
    const rgb: RGB = { r: 255, g: 255, b: 255 }
    const hsl = rgbToHsl(rgb)
    expect(hsl.h).toBe(0)
    expect(hsl.s).toBe(0)
    expect(hsl.l).toBeCloseTo(1, 1)
  })

  it("converts black to HSL", () => {
    const rgb: RGB = { r: 0, g: 0, b: 0 }
    const hsl = rgbToHsl(rgb)
    expect(hsl.h).toBe(0)
    expect(hsl.s).toBe(0)
    expect(hsl.l).toBe(0)
  })

  it("converts gray to HSL", () => {
    const rgb: RGB = { r: 128, g: 128, b: 128 }
    const hsl = rgbToHsl(rgb)
    expect(hsl.h).toBe(0)
    expect(hsl.s).toBeCloseTo(0, 1)
    expect(hsl.l).toBeCloseTo(0.502, 2)
  })
})

describe("hslToRgb", () => {
  it("converts HSL to pure red", () => {
    const hsl: HSL = { h: 0, s: 1, l: 0.5 }
    const rgb = hslToRgb(hsl)
    expect(rgb.r).toBe(255)
    expect(rgb.g).toBe(0)
    expect(rgb.b).toBe(0)
  })

  it("converts HSL to pure green", () => {
    const hsl: HSL = { h: 120, s: 1, l: 0.5 }
    const rgb = hslToRgb(hsl)
    expect(rgb.r).toBe(0)
    expect(rgb.g).toBe(255)
    expect(rgb.b).toBe(0)
  })

  it("converts HSL to pure blue", () => {
    const hsl: HSL = { h: 240, s: 1, l: 0.5 }
    const rgb = hslToRgb(hsl)
    expect(rgb.r).toBe(0)
    expect(rgb.g).toBe(0)
    expect(rgb.b).toBe(255)
  })

  it("converts HSL to white", () => {
    const hsl: HSL = { h: 0, s: 0, l: 1 }
    const rgb = hslToRgb(hsl)
    expect(rgb.r).toBe(255)
    expect(rgb.g).toBe(255)
    expect(rgb.b).toBe(255)
  })

  it("converts HSL to black", () => {
    const hsl: HSL = { h: 0, s: 0, l: 0 }
    const rgb = hslToRgb(hsl)
    expect(rgb.r).toBe(0)
    expect(rgb.g).toBe(0)
    expect(rgb.b).toBe(0)
  })
})

describe("RGB to HSL and back conversion", () => {
  it("is reversible for various colors", () => {
    const colors: RGB[] = [
      { r: 255, g: 0, b: 0 }, // Red
      { r: 0, g: 255, b: 0 }, // Green
      { r: 0, g: 0, b: 255 }, // Blue
      { r: 255, g: 255, b: 0 }, // Yellow
      { r: 255, g: 0, b: 255 }, // Magenta
      { r: 0, g: 255, b: 255 }, // Cyan
      { r: 128, g: 64, b: 192 }, // Purple
      { r: 64, g: 128, b: 96 }, // Teal-ish
    ]

    for (const originalRgb of colors) {
      const hsl = rgbToHsl(originalRgb)
      const convertedRgb = hslToRgb(hsl)

      // Allow small rounding errors
      expect(convertedRgb.r).toBeCloseTo(originalRgb.r, 0)
      expect(convertedRgb.g).toBeCloseTo(originalRgb.g, 0)
      expect(convertedRgb.b).toBeCloseTo(originalRgb.b, 0)
    }
  })
})

describe("calculateLuminance", () => {
  it("calculates luminance for white", () => {
    const rgb: RGB = { r: 255, g: 255, b: 255 }
    const luminance = calculateLuminance(rgb)
    expect(luminance).toBeCloseTo(1, 2)
  })

  it("calculates luminance for black", () => {
    const rgb: RGB = { r: 0, g: 0, b: 0 }
    const luminance = calculateLuminance(rgb)
    expect(luminance).toBe(0)
  })

  it("calculates luminance for red", () => {
    const rgb: RGB = { r: 255, g: 0, b: 0 }
    const luminance = calculateLuminance(rgb)
    expect(luminance).toBeGreaterThan(0)
    expect(luminance).toBeLessThan(1)
    // Red has relatively low luminance
    expect(luminance).toBeCloseTo(0.2126, 2)
  })

  it("calculates luminance for green", () => {
    const rgb: RGB = { r: 0, g: 255, b: 0 }
    const luminance = calculateLuminance(rgb)
    // Green has the highest luminance among primary colors
    expect(luminance).toBeCloseTo(0.7152, 2)
  })

  it("calculates luminance for blue", () => {
    const rgb: RGB = { r: 0, g: 0, b: 255 }
    const luminance = calculateLuminance(rgb)
    // Blue has the lowest luminance among primary colors
    expect(luminance).toBeCloseTo(0.0722, 2)
  })
})
