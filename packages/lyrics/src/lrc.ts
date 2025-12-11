import type { Lyrics } from "./model"
import { parseLrcTimeToMs } from "./lrc/time"

interface LrcLine {
  readonly timestamp: number
  readonly text: string
}

interface EnhancedLrcWord {
  readonly timestamp: number
  readonly word: string
}

function parseStandardLrcLine(line: string): LrcLine | null {
  // Match [mm:ss.xx]lyrics text
  const match = /^\[(\d{1,2}:\d{2}\.\d{2,3})\](.*)$/.exec(line.trim())
  if (!match) return null

  const timestamp = parseLrcTimeToMs(match[1])
  if (timestamp == null) return null

  return {
    timestamp,
    text: match[2].trim(),
  }
}

function parseEnhancedLrcLine(line: string): {
  readonly timestamp: number | null
  readonly words: readonly EnhancedLrcWord[]
} | null {
  // First, check if line starts with [mm:ss.xx] for line timestamp
  const lineTimestampMatch = /^\[(\d{1,2}:\d{2}\.\d{2,3})\](.*)$/.exec(
    line.trim(),
  )
  if (!lineTimestampMatch) return null

  const lineTimestamp = parseLrcTimeToMs(lineTimestampMatch[1])
  if (lineTimestamp == null) return null

  const content = lineTimestampMatch[2].trim()

  // Parse word-level timestamps: <mm:ss.xx>word
  const words: EnhancedLrcWord[] = []
  const wordPattern = /<(\d{1,2}:\d{2}\.\d{2,3})>([^<]*)/g
  let wordMatch: RegExpExecArray | null

  while ((wordMatch = wordPattern.exec(content)) !== null) {
    const wordTimestamp = parseLrcTimeToMs(wordMatch[1])
    if (wordTimestamp != null) {
      const word = wordMatch[2].trim()
      if (word) {
        words.push({ timestamp: wordTimestamp, word })
      }
    }
  }

  return {
    timestamp: lineTimestamp,
    words: words.length > 0 ? words : [],
  }
}

function isMetadataLine(line: string): boolean {
  // Metadata lines: [ar:artist], [ti:title], [al:album], etc.
  return /^\[[a-z]+:/.test(line.trim())
}

export function parseLRCtoLyrics(input: string): Lyrics {
  const lines = input.split("\n")
  const lrcLines: LrcLine[] = []
  const enhancedLines: {
    readonly timestamp: number
    readonly words: readonly EnhancedLrcWord[]
  }[] = []

  // First pass: detect format and parse lines
  let isEnhancedFormat = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || isMetadataLine(trimmed)) continue

    // Try enhanced format first
    const enhanced = parseEnhancedLrcLine(trimmed)
    if (enhanced && enhanced.words.length > 0) {
      isEnhancedFormat = true
      enhancedLines.push({
        timestamp: enhanced.timestamp,
        words: enhanced.words,
      })
      continue
    }

    // Try standard format
    const standard = parseStandardLrcLine(trimmed)
    if (standard) {
      lrcLines.push(standard)
    }
  }

  // Convert to Lyrics format
  const result: Lyrics = []

  if (isEnhancedFormat && enhancedLines.length > 0) {
    // Enhanced LRC: has word-level timestamps
    for (let i = 0; i < enhancedLines.length; i++) {
      const line = enhancedLines[i]
      const nextLine = enhancedLines[i + 1]
      const lineStartMs = Math.max(1, line.timestamp)

      // Build full text from words
      const fullText = line.words.map((w) => w.word).join(" ")

      // Calculate end time: use next line's timestamp or estimate
      const lineEndMs = nextLine
        ? nextLine.timestamp
        : lineStartMs + Math.max(2000, fullText.length * 100)

      // Build tokens with offsets from line start
      const tokens: { c: string; d: number }[] = []

      for (let j = 0; j < line.words.length; j++) {
        const word = line.words[j]
        const nextWord = line.words[j + 1]

        // Calculate offset from line start
        const offset = Math.max(1, word.timestamp - lineStartMs)

        // For spacing between words (except last word)
        const wordText = j < line.words.length - 1 ? word.word + " " : word.word

        tokens.push({
          c: wordText,
          d: Math.max(1, Math.round(offset)),
        })

        // If this is the last word and we have time left, we might want to add spacing
        if (j === line.words.length - 1 && nextWord == null) {
          // Last word - calculate duration until line end
          const remainingTime = lineEndMs - word.timestamp
          if (remainingTime > 100) {
            // If there's significant time remaining, the word has duration
            // The offset 'd' represents start time, not duration
            // So we don't need to do anything special here
          }
        }
      }

      result.push({
        ts: Math.round(lineStartMs),
        te: Math.round(lineEndMs),
        l: tokens,
        t: fullText,
      })
    }
  } else if (lrcLines.length > 0) {
    // Standard LRC: only line-level timestamps
    for (let i = 0; i < lrcLines.length; i++) {
      const line = lrcLines[i]
      const nextLine = lrcLines[i + 1]
      const startMs = Math.max(1, line.timestamp)

      // Calculate end time: use next line's timestamp or estimate
      const endMs = nextLine
        ? nextLine.timestamp
        : startMs + Math.max(2000, line.text.length * 100)

      // For standard LRC, we treat the entire line as one token
      // since we don't have word-level timing
      const tokens: { c: string; d: number }[] = line.text
        ? [{ c: line.text, d: 1 }]
        : []

      result.push({
        ts: Math.round(startMs),
        te: Math.round(endMs),
        l: tokens,
        t: line.text,
      })
    }
  }

  // Sort by timestamp
  result.sort((a, b) => a.ts - b.ts)

  return result
}
