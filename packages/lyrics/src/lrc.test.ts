import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { expect, suite, test } from "vitest"

import { parseLRCtoLyrics } from "./lrc"
import { parseLrcTimeToMs } from "./lrc/time"
import { LyricsSchema } from "./model"

void suite("LRC time parser", () => {
  void test("parses standard format mm:ss.cc (centiseconds)", () => {
    expect(parseLrcTimeToMs("[00:12.00]")).toBe(12_000)
    expect(parseLrcTimeToMs("[00:17.20]")).toBe(17_200)
    expect(parseLrcTimeToMs("[01:23.45]")).toBe(83_450)
  })

  void test("parses format with milliseconds", () => {
    expect(parseLrcTimeToMs("[00:12.000]")).toBe(12_000)
    expect(parseLrcTimeToMs("[00:17.200]")).toBe(17_200)
    expect(parseLrcTimeToMs("[01:23.456]")).toBe(83_456)
  })

  void test("parses angle bracket format for enhanced LRC", () => {
    expect(parseLrcTimeToMs("<00:00.00>")).toBe(0)
    expect(parseLrcTimeToMs("<00:00.50>")).toBe(500)
    expect(parseLrcTimeToMs("<00:01.00>")).toBe(1000)
  })

  void test("returns undefined for invalid formats", () => {
    expect(parseLrcTimeToMs("")).toBe(undefined)
    expect(parseLrcTimeToMs("invalid")).toBe(undefined)
    expect(parseLrcTimeToMs("[00:00]")).toBe(undefined)
    expect(parseLrcTimeToMs("[0:0.0]")).toBe(undefined)
  })
})

void suite("Standard LRC parser", () => {
  void test("parses standard LRC file", () => {
    const file = resolve(__dirname, "./test/test_standard.lrc")
    const lrc = readFileSync(file, "utf8")
    const parsed = parseLRCtoLyrics(lrc)

    expect(parsed.length).toBeGreaterThan(0)
    expect(parsed[0]?.ts).toBe(12_000)
    expect(parsed[0]?.t).toBe("Line 1 lyrics")
    expect(parsed[1]?.ts).toBe(17_200)
    expect(parsed[1]?.t).toBe("Line 2 lyrics")
  })

  void test("standard LRC matches LyricsSchema", () => {
    const file = resolve(__dirname, "./test/test_standard.lrc")
    const lrc = readFileSync(file, "utf8")
    const parsed = parseLRCtoLyrics(lrc)
    const result = LyricsSchema.safeParse(parsed)
    expect(result.success).toBe(true)
  })

  void test("calculates end times from next line timestamp", () => {
    const lrc = `[00:01.00]First line
[00:03.00]Second line
[00:05.00]Third line`
    const parsed = parseLRCtoLyrics(lrc)

    expect(parsed[0]?.ts).toBe(1000)
    expect(parsed[0]?.te).toBe(3000) // End at start of next line
    expect(parsed[1]?.ts).toBe(3000)
    expect(parsed[1]?.te).toBe(5000)
  })

  void test("estimates end time for last line", () => {
    const lrc = `[00:01.00]Only line`
    const parsed = parseLRCtoLyrics(lrc)

    expect(parsed[0]?.ts).toBe(1000)
    expect(parsed[0]?.te).toBeGreaterThan(1000) // Should have estimated end time
  })

  void test("ignores metadata lines", () => {
    const lrc = `[ar:Artist Name]
[ti:Song Title]
[00:01.00]Actual lyrics`
    const parsed = parseLRCtoLyrics(lrc)

    expect(parsed.length).toBe(1)
    expect(parsed[0]?.t).toBe("Actual lyrics")
  })

  void test("handles empty lines", () => {
    const lrc = `[00:01.00]First line

[00:03.00]Second line`
    const parsed = parseLRCtoLyrics(lrc)

    expect(parsed.length).toBe(2)
    expect(parsed[0]?.t).toBe("First line")
    expect(parsed[1]?.t).toBe("Second line")
  })
})

void suite("Enhanced LRC parser", () => {
  void test("parses enhanced LRC file with word timestamps", () => {
    const file = resolve(__dirname, "./test/test_enhanced.lrc")
    const lrc = readFileSync(file, "utf8")
    const parsed = parseLRCtoLyrics(lrc)

    expect(parsed.length).toBe(2)
    expect(parsed[0]?.ts).toBe(1) // Minimum timestamp is 1ms
    expect(parsed[0]?.t).toBe("Hello, darkness, my old friend")
    expect(parsed[0]?.l.length).toBeGreaterThan(1) // Should have multiple tokens
  })

  void test("enhanced LRC matches LyricsSchema", () => {
    const file = resolve(__dirname, "./test/test_enhanced.lrc")
    const lrc = readFileSync(file, "utf8")
    const parsed = parseLRCtoLyrics(lrc)
    const result = LyricsSchema.safeParse(parsed)
    expect(result.success).toBe(true)
  })

  void test("word timestamps create tokens with correct offsets", () => {
    const lrc = `[00:00.00]<00:00.00>First <00:00.50>second <00:01.00>third`
    const parsed = parseLRCtoLyrics(lrc)

    expect(parsed[0]?.l.length).toBe(3)
    expect(parsed[0]?.l[0]?.c).toBe("First ")
    expect(parsed[0]?.l[0]?.d).toBe(1) // Offset from line start (min 1)
    expect(parsed[0]?.l[1]?.c).toBe("second ")
    // Line starts at 1ms (min), word at 500ms = 499ms offset
    expect(parsed[0]?.l[1]?.d).toBe(499)
    expect(parsed[0]?.l[2]?.c).toBe("third")
    // Line starts at 1ms (min), word at 1000ms = 999ms offset
    expect(parsed[0]?.l[2]?.d).toBe(999)
  })

  void test("handles mixed format - prefers enhanced when detected", () => {
    const lrc = `[00:01.00]<00:01.00>Word1 <00:01.50>Word2
[00:03.00]Plain line without words`
    const parsed = parseLRCtoLyrics(lrc)

    // Should detect enhanced format and process first line
    expect(parsed.length).toBeGreaterThan(0)
    expect(parsed[0]?.l.length).toBeGreaterThan(1)
  })
})
