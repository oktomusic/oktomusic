import { describe, it, expect } from "vitest"

import { generatePalette } from "./palette"
import type { Swatch } from "./types"

describe("generatePalette", () => {
  it("returns null palette for empty swatches array", () => {
    const palette = generatePalette([])
    expect(palette.Vibrant).toBeNull()
    expect(palette.LightVibrant).toBeNull()
    expect(palette.DarkVibrant).toBeNull()
    expect(palette.Muted).toBeNull()
    expect(palette.LightMuted).toBeNull()
    expect(palette.DarkMuted).toBeNull()
  })

  it("selects vibrant swatch with high saturation", () => {
    const swatches: Swatch[] = [
      {
        rgb: { r: 200, g: 50, b: 50 },
        hsl: { h: 0, s: 0.6, l: 0.49 },
        population: 100,
      },
      {
        rgb: { r: 100, g: 100, b: 100 },
        hsl: { h: 0, s: 0, l: 0.39 },
        population: 200,
      },
    ]

    const palette = generatePalette(swatches)
    expect(palette.Vibrant).not.toBeNull()
    expect(palette.Vibrant?.hsl.s).toBeGreaterThanOrEqual(0.35)
  })

  it("selects light vibrant swatch with high saturation and lightness", () => {
    const swatches: Swatch[] = [
      {
        rgb: { r: 255, g: 150, b: 150 },
        hsl: { h: 0, s: 1.0, l: 0.79 },
        population: 100,
      },
      {
        rgb: { r: 200, g: 50, b: 50 },
        hsl: { h: 0, s: 0.6, l: 0.49 },
        population: 100,
      },
    ]

    const palette = generatePalette(swatches)
    expect(palette.LightVibrant).not.toBeNull()
    expect(palette.LightVibrant?.hsl.s).toBeGreaterThanOrEqual(0.35)
    expect(palette.LightVibrant?.hsl.l).toBeGreaterThanOrEqual(0.55)
  })

  it("selects dark vibrant swatch with high saturation and low lightness", () => {
    const swatches: Swatch[] = [
      {
        rgb: { r: 100, g: 20, b: 20 },
        hsl: { h: 0, s: 0.67, l: 0.24 },
        population: 100,
      },
      {
        rgb: { r: 200, g: 50, b: 50 },
        hsl: { h: 0, s: 0.6, l: 0.49 },
        population: 100,
      },
    ]

    const palette = generatePalette(swatches)
    expect(palette.DarkVibrant).not.toBeNull()
    expect(palette.DarkVibrant?.hsl.s).toBeGreaterThanOrEqual(0.35)
    expect(palette.DarkVibrant?.hsl.l).toBeLessThanOrEqual(0.4)
  })

  it("selects muted swatch with low saturation", () => {
    const swatches: Swatch[] = [
      {
        rgb: { r: 150, g: 130, b: 130 },
        hsl: { h: 0, s: 0.13, l: 0.55 },
        population: 100,
      },
      {
        rgb: { r: 200, g: 50, b: 50 },
        hsl: { h: 0, s: 0.6, l: 0.49 },
        population: 100,
      },
    ]

    const palette = generatePalette(swatches)
    expect(palette.Muted).not.toBeNull()
    expect(palette.Muted?.hsl.s).toBeLessThanOrEqual(0.4)
  })

  it("selects light muted swatch with low saturation and high lightness", () => {
    const swatches: Swatch[] = [
      {
        rgb: { r: 220, g: 210, b: 210 },
        hsl: { h: 0, s: 0.2, l: 0.84 },
        population: 100,
      },
      {
        rgb: { r: 150, g: 130, b: 130 },
        hsl: { h: 0, s: 0.13, l: 0.55 },
        population: 100,
      },
    ]

    const palette = generatePalette(swatches)
    expect(palette.LightMuted).not.toBeNull()
    expect(palette.LightMuted?.hsl.s).toBeLessThanOrEqual(0.4)
    expect(palette.LightMuted?.hsl.l).toBeGreaterThanOrEqual(0.55)
  })

  it("selects dark muted swatch with low saturation and low lightness", () => {
    const swatches: Swatch[] = [
      {
        rgb: { r: 80, g: 70, b: 70 },
        hsl: { h: 0, s: 0.07, l: 0.29 },
        population: 100,
      },
      {
        rgb: { r: 150, g: 130, b: 130 },
        hsl: { h: 0, s: 0.13, l: 0.55 },
        population: 100,
      },
    ]

    const palette = generatePalette(swatches)
    expect(palette.DarkMuted).not.toBeNull()
    expect(palette.DarkMuted?.hsl.s).toBeLessThanOrEqual(0.4)
    expect(palette.DarkMuted?.hsl.l).toBeLessThanOrEqual(0.4)
  })

  it("prefers swatches with higher population when scores are similar", () => {
    const swatches: Swatch[] = [
      {
        rgb: { r: 200, g: 50, b: 50 },
        hsl: { h: 0, s: 0.6, l: 0.49 },
        population: 1000,
      },
      {
        rgb: { r: 210, g: 55, b: 55 },
        hsl: { h: 0, s: 0.62, l: 0.52 },
        population: 10,
      },
    ]

    const palette = generatePalette(swatches)
    expect(palette.Vibrant?.population).toBe(1000)
  })

  it("handles single swatch", () => {
    const swatches: Swatch[] = [
      {
        rgb: { r: 200, g: 50, b: 50 },
        hsl: { h: 0, s: 0.6, l: 0.49 },
        population: 100,
      },
    ]

    const palette = generatePalette(swatches)
    // At least one palette entry should be selected
    const hasAtLeastOne =
      palette.Vibrant !== null ||
      palette.LightVibrant !== null ||
      palette.DarkVibrant !== null ||
      palette.Muted !== null ||
      palette.LightMuted !== null ||
      palette.DarkMuted !== null

    expect(hasAtLeastOne).toBe(true)
  })
})
