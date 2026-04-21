import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { parseM3U, generateM3U } from "../src/m3u";

import { playlistM3U } from "./common";

const playlistFixturePath = resolve(__dirname, "./files/playlist.m3u");
const playlistFixture = readFileSync(playlistFixturePath, "utf8").trimEnd();

describe("M3U parser/generator", () => {
  it("generates the expected M3U output", () => {
    expect(generateM3U(playlistM3U)).toBe(playlistFixture);
  });

  it("parses the sample M3U file", () => {
    expect(
      parseM3U(playlistFixture, playlistM3U.playlist.title as string),
    ).toEqual(playlistM3U);
  });

  it("round-trips playlist data", () => {
    const parsed = parseM3U(
      generateM3U(playlistM3U),
      playlistM3U.playlist.title,
    );

    expect(parsed).toEqual(playlistM3U);
  });

  it("throws when the header is missing", () => {
    expect(() => parseM3U("#EXTINF:238,Phoenix\ntrack.flac", "Broken")).toThrow(
      "Invalid M3U format: Missing #EXTM3U header",
    );
  });

  it("throws when an EXTINF line is malformed", () => {
    expect(() =>
      parseM3U("#EXTM3U\n#EXTINF:not-a-number,Phoenix\ntrack.flac", "Broken"),
    ).toThrow("Invalid EXTINF line: #EXTINF:not-a-number,Phoenix");
  });

  it("throws when an EXTINF line is missing the comma separator", () => {
    expect(() =>
      parseM3U("#EXTM3U\n#EXTINF:238Phoenix\ntrack.flac", "Broken"),
    ).toThrow("Invalid EXTINF line: #EXTINF:238Phoenix");
  });

  it("throws when an EXTINF line has a negative duration", () => {
    expect(() =>
      parseM3U("#EXTM3U\n#EXTINF:-238,Phoenix\ntrack.flac", "Broken"),
    ).toThrow("Invalid EXTINF line: #EXTINF:-238,Phoenix");
  });

  it("throws when the file entry is missing after EXTINF", () => {
    expect(() => parseM3U("#EXTM3U\n#EXTINF:238,Phoenix", "Broken")).toThrow(
      "Unexpected end of M3U file after EXTINF line",
    );
  });

  it("throws when a non-EXTINF line appears after the header", () => {
    expect(() => parseM3U("#EXTM3U\ntrack.flac", "Broken")).toThrow(
      "Unexpected line in M3U file: track.flac",
    );
  });

  it("parses an empty playlist with only the header", () => {
    const emptyM3U = "#EXTM3U";
    const parsed = parseM3U(emptyM3U, "Empty Playlist");

    expect(generateM3U(parsed)).toBe(emptyM3U);
  });
});
