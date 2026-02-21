import { describe, expect, it } from "vitest";

import type { LyricsChunk, LyricsLine } from "../api/graphql/gql/graphql";

import { isCurrentLine, isWordPassed } from "./lyrics";

describe("isCurrentLine", () => {
  const createMockLine = (ts: number, te: number): LyricsLine => ({
    __typename: "LyricsLine",
    ts,
    te,
    t: "Mock line",
    l: [],
  });

  it("returns true when current position is exactly at line start", () => {
    const line = createMockLine(1000, 2000);
    expect(isCurrentLine(1000, line)).toBe(true);
  });

  it("returns true when current position is in the middle of the line", () => {
    const line = createMockLine(1000, 2000);
    expect(isCurrentLine(1500, line)).toBe(true);
  });

  it("returns true when current position is just before line end", () => {
    const line = createMockLine(1000, 2000);
    expect(isCurrentLine(1999, line)).toBe(true);
  });

  it("returns false when current position is exactly at line end", () => {
    const line = createMockLine(1000, 2000);
    expect(isCurrentLine(2000, line)).toBe(false);
  });

  it("returns false when current position is before line start", () => {
    const line = createMockLine(1000, 2000);
    expect(isCurrentLine(999, line)).toBe(false);
  });

  it("returns false when current position is after line end", () => {
    const line = createMockLine(1000, 2000);
    expect(isCurrentLine(2001, line)).toBe(false);
  });

  it("handles line starting at zero", () => {
    const line = createMockLine(0, 1000);
    expect(isCurrentLine(0, line)).toBe(true);
    expect(isCurrentLine(500, line)).toBe(true);
    expect(isCurrentLine(1000, line)).toBe(false);
  });

  it("handles very short lines", () => {
    const line = createMockLine(1000, 1001);
    expect(isCurrentLine(1000, line)).toBe(true);
    expect(isCurrentLine(1001, line)).toBe(false);
  });

  it("handles very long lines", () => {
    const line = createMockLine(0, 60_000);
    expect(isCurrentLine(0, line)).toBe(true);
    expect(isCurrentLine(30_000, line)).toBe(true);
    expect(isCurrentLine(59_999, line)).toBe(true);
    expect(isCurrentLine(60_000, line)).toBe(false);
  });

  it("handles negative positions", () => {
    const line = createMockLine(1000, 2000);
    expect(isCurrentLine(-1, line)).toBe(false);
  });

  it("handles edge case with position as floating point number", () => {
    const line = createMockLine(1000, 2000);
    expect(isCurrentLine(1000.5, line)).toBe(true);
    expect(isCurrentLine(1999.9, line)).toBe(true);
  });
});

describe("isWordPassed", () => {
  const createMockWord = (d: number): LyricsChunk => ({
    __typename: "LyricsChunk",
    d,
    c: "MockWord",
  });

  it("returns true when current position is exactly at word start (d + offset)", () => {
    const word = createMockWord(1000);
    expect(isWordPassed(1500, 500, word)).toBe(true);
  });

  it("returns true when current position is after word start", () => {
    const word = createMockWord(1000);
    expect(isWordPassed(1600, 500, word)).toBe(true);
  });

  it("returns false when current position is before word start", () => {
    const word = createMockWord(1000);
    expect(isWordPassed(1400, 500, word)).toBe(false);
  });

  it("returns false when current position is just before word start", () => {
    const word = createMockWord(1000);
    expect(isWordPassed(1499, 500, word)).toBe(false);
  });

  it("handles zero word delay", () => {
    const word = createMockWord(0);
    expect(isWordPassed(500, 500, word)).toBe(true);
    expect(isWordPassed(499, 500, word)).toBe(false);
  });

  it("handles zero offset", () => {
    const word = createMockWord(1000);
    expect(isWordPassed(1000, 0, word)).toBe(true);
    expect(isWordPassed(999, 0, word)).toBe(false);
  });

  it("handles negative offset", () => {
    const word = createMockWord(1000);
    expect(isWordPassed(900, -100, word)).toBe(true);
    expect(isWordPassed(899, -100, word)).toBe(false);
  });

  it("handles negative current position", () => {
    const word = createMockWord(1000);
    expect(isWordPassed(-1, 500, word)).toBe(false);
  });

  it("handles floating point positions", () => {
    const word = createMockWord(1000);
    expect(isWordPassed(1500.5, 500, word)).toBe(true);
    expect(isWordPassed(1500.0, 500, word)).toBe(true);
    expect(isWordPassed(1499.9, 500, word)).toBe(false);
  });

  it("handles floating point offsets", () => {
    const word = createMockWord(1000);
    expect(isWordPassed(1500.5, 500.5, word)).toBe(true);
    expect(isWordPassed(1500.4, 500.5, word)).toBe(false);
  });

  it("handles large values", () => {
    const word = createMockWord(60_000);
    expect(isWordPassed(61_000, 1000, word)).toBe(true);
    expect(isWordPassed(60_999, 1000, word)).toBe(false);
  });
});
