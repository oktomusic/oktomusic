/**
 * Modified Median Cut Quantization (MMCQ) implementation for color quantization.
 * 
 * This algorithm quantizes image colors by recursively subdividing the color space
 * into smaller boxes based on the color with the widest range, then selecting
 * representative colors from each box weighted by their population.
 * 
 * Based on the node-vibrant library algorithm.
 * Reference: https://github.com/Vibrant-Colors/node-vibrant
 * Original algorithm: Leptonica library (http://www.leptonica.com/)
 */

import { rgbToHsl } from "./color-convert"
import type { RGB, HSL, Swatch, PixelData } from "./types"

/**
 * Number of significant bits to use for color quantization.
 * Reduces 8-bit color channels to 5-bit for faster processing.
 */
const SIGBITS = 5
const RSHIFT = 8 - SIGBITS
const MAX_ITERATIONS = 1000
const FRACT_BY_POPULATION = 0.75

/**
 * A 3D color space box representing a range of colors in the RGB cube.
 * Used by the MMCQ algorithm to partition the color space.
 */
class VBox {
  private _volume = 0
  private _count = 0
  private _avg: RGB | null = null

  constructor(
    public r1: number,
    public r2: number,
    public g1: number,
    public g2: number,
    public b1: number,
    public b2: number,
    public readonly histo: number[],
  ) {}

  /**
   * Calculate the volume of this color box.
   */
  volume(force = false): number {
    if (!this._volume || force) {
      this._volume =
        (this.r2 - this.r1 + 1) *
        (this.g2 - this.g1 + 1) *
        (this.b2 - this.b1 + 1)
    }
    return this._volume
  }

  /**
   * Count the number of pixels in this box.
   */
  count(force = false): number {
    if (!this._count || force) {
      let npix = 0
      for (let i = this.r1; i <= this.r2; i++) {
        for (let j = this.g1; j <= this.g2; j++) {
          for (let k = this.b1; k <= this.b2; k++) {
            const index = getColorIndex(i, j, k)
            npix += this.histo[index] || 0
          }
        }
      }
      this._count = npix
    }
    return this._count
  }

  /**
   * Create a copy of this VBox.
   */
  clone(): VBox {
    return new VBox(this.r1, this.r2, this.g1, this.g2, this.b1, this.b2, this.histo)
  }

  /**
   * Calculate the average color in this box weighted by population.
   */
  avg(force = false): RGB {
    if (!this._avg || force) {
      let ntot = 0
      const mult = 1 << (8 - SIGBITS)
      let rsum = 0
      let gsum = 0
      let bsum = 0

      for (let i = this.r1; i <= this.r2; i++) {
        for (let j = this.g1; j <= this.g2; j++) {
          for (let k = this.b1; k <= this.b2; k++) {
            const index = getColorIndex(i, j, k)
            const hval = this.histo[index] || 0
            ntot += hval
            rsum += hval * (i + 0.5) * mult
            gsum += hval * (j + 0.5) * mult
            bsum += hval * (k + 0.5) * mult
          }
        }
      }

      if (ntot > 0) {
        this._avg = {
          r: Math.round(rsum / ntot),
          g: Math.round(gsum / ntot),
          b: Math.round(bsum / ntot),
        }
      } else {
        // Fallback to center of the box
        this._avg = {
          r: Math.round((mult * (this.r1 + this.r2 + 1)) / 2),
          g: Math.round((mult * (this.g1 + this.g2 + 1)) / 2),
          b: Math.round((mult * (this.b1 + this.b2 + 1)) / 2),
        }
      }
    }
    return this._avg
  }

  /**
   * Check if this box contains a single color.
   */
  contains(rgb: RGB): boolean {
    const rval = rgb.r >> RSHIFT
    const gval = rgb.g >> RSHIFT
    const bval = rgb.b >> RSHIFT
    return (
      rval >= this.r1 &&
      rval <= this.r2 &&
      gval >= this.g1 &&
      gval <= this.g2 &&
      bval >= this.b1 &&
      bval <= this.b2
    )
  }
}

/**
 * Convert RGB values to a color index in the histogram.
 * Uses bit shifting to pack RGB into a single integer.
 */
function getColorIndex(r: number, g: number, b: number): number {
  return (r << (2 * SIGBITS)) + (g << SIGBITS) + b
}

/**
 * Build a histogram of quantized colors from pixel data.
 * 
 * @param pixels - Raw pixel data from image
 * @returns Histogram array where index is the quantized color and value is the count
 */
function buildHistogram(pixels: PixelData): number[] {
  const histo: number[] = new Array(1 << (3 * SIGBITS)).fill(0)
  const data = pixels.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] >> RSHIFT
    const g = data[i + 1] >> RSHIFT
    const b = data[i + 2] >> RSHIFT
    const a = data[i + 3]

    // Skip transparent pixels
    if (a >= 125) {
      const index = getColorIndex(r, g, b)
      histo[index] = (histo[index] || 0) + 1
    }
  }

  return histo
}

/**
 * Create the initial VBox containing all colors in the histogram.
 */
function createVBoxFromHistogram(histo: number[]): VBox {
  let rmin = Number.MAX_VALUE
  let rmax = 0
  let gmin = Number.MAX_VALUE
  let gmax = 0
  let bmin = Number.MAX_VALUE
  let bmax = 0

  // Find the bounding box of all colors
  for (let i = 0; i < histo.length; i++) {
    if (histo[i] > 0) {
      const r = (i >> (2 * SIGBITS)) & ((1 << SIGBITS) - 1)
      const g = (i >> SIGBITS) & ((1 << SIGBITS) - 1)
      const b = i & ((1 << SIGBITS) - 1)

      rmin = Math.min(rmin, r)
      rmax = Math.max(rmax, r)
      gmin = Math.min(gmin, g)
      gmax = Math.max(gmax, g)
      bmin = Math.min(bmin, b)
      bmax = Math.max(bmax, b)
    }
  }

  return new VBox(rmin, rmax, gmin, gmax, bmin, bmax, histo)
}

/**
 * Find the median of colors in a VBox along a specific dimension.
 */
function medianCutApply(histo: number[], vbox: VBox): [VBox, VBox] | null {
  if (vbox.count() === 0) return null

  // Only one pixel, no split possible
  if (vbox.count() === 1) return null

  const rw = vbox.r2 - vbox.r1 + 1
  const gw = vbox.g2 - vbox.g1 + 1
  const bw = vbox.b2 - vbox.b1 + 1
  const maxw = Math.max(rw, gw, bw)

  // Find the partial sum arrays along the selected axis
  let total = 0
  const partialsum: number[] = []

  if (maxw === rw) {
    for (let i = vbox.r1; i <= vbox.r2; i++) {
      let sum = 0
      for (let j = vbox.g1; j <= vbox.g2; j++) {
        for (let k = vbox.b1; k <= vbox.b2; k++) {
          const index = getColorIndex(i, j, k)
          sum += histo[index] || 0
        }
      }
      total += sum
      partialsum[i] = total
    }
  } else if (maxw === gw) {
    for (let i = vbox.g1; i <= vbox.g2; i++) {
      let sum = 0
      for (let j = vbox.r1; j <= vbox.r2; j++) {
        for (let k = vbox.b1; k <= vbox.b2; k++) {
          const index = getColorIndex(j, i, k)
          sum += histo[index] || 0
        }
      }
      total += sum
      partialsum[i] = total
    }
  } else {
    for (let i = vbox.b1; i <= vbox.b2; i++) {
      let sum = 0
      for (let j = vbox.r1; j <= vbox.r2; j++) {
        for (let k = vbox.g1; k <= vbox.g2; k++) {
          const index = getColorIndex(j, k, i)
          sum += histo[index] || 0
        }
      }
      total += sum
      partialsum[i] = total
    }
  }

  // Find the median point
  let splitPoint = -1
  for (let i = 0; i < partialsum.length; i++) {
    if (partialsum[i] > total / 2) {
      splitPoint = i
      break
    }
  }

  if (splitPoint === -1) {
    splitPoint = partialsum.length - 1
  }

  // Create two new VBoxes by splitting at the median
  const vbox1 = vbox.clone()
  const vbox2 = vbox.clone()

  if (maxw === rw) {
    vbox1.r2 = splitPoint
    vbox2.r1 = splitPoint + 1
  } else if (maxw === gw) {
    vbox1.g2 = splitPoint
    vbox2.g1 = splitPoint + 1
  } else {
    vbox1.b2 = splitPoint
    vbox2.b1 = splitPoint + 1
  }

  return [vbox1, vbox2]
}

/**
 * Perform iterative median cut on a priority queue of VBoxes.
 * 
 * @param pq - Priority queue of VBoxes to split
 * @param target - Target number of colors to generate
 */
function quantizeIter(pq: VBox[], target: number): void {
  let ncolors = 1
  let niters = 0

  while (niters < MAX_ITERATIONS) {
    const vbox = pq.pop()
    if (!vbox) break

    // Split the box
    const result = medianCutApply(vbox.histo, vbox)
    if (!result) {
      pq.push(vbox)
      niters++
      continue
    }

    const [vbox1, vbox2] = result
    pq.push(vbox1)

    if (vbox2.count() > 0) {
      pq.push(vbox2)
      ncolors++
    }

    // Sort by count * volume for priority
    pq.sort((a, b) => a.count() * a.volume() - b.count() * b.volume())

    if (ncolors >= target) break
    niters++
  }
}

/**
 * Quantize pixel data into a palette of swatches using MMCQ algorithm.
 * 
 * @param pixels - Raw pixel data from the image
 * @param maxColors - Maximum number of colors to extract (default: 64)
 * @returns Array of color swatches with RGB, HSL, and population
 */
export function quantize(pixels: PixelData, maxColors = 64): Swatch[] {
  // Build histogram
  const histo = buildHistogram(pixels)

  // Create initial VBox
  const vbox = createVBoxFromHistogram(histo)

  // Create priority queue
  const pq: VBox[] = [vbox]

  // First cut to 75% of max colors by population
  const target1 = Math.floor(maxColors * FRACT_BY_POPULATION)
  quantizeIter(pq, target1)

  // Sort by product of volume and count for remaining cuts
  pq.sort((a, b) => a.count() - b.count())

  // Second cut to reach max colors
  quantizeIter(pq, maxColors - pq.length)

  // Convert VBoxes to swatches
  const swatches: Swatch[] = []
  for (const vb of pq) {
    const rgb = vb.avg()
    const hsl = rgbToHsl(rgb)
    const population = vb.count()

    swatches.push({
      rgb,
      hsl,
      population,
    })
  }

  return swatches
}
