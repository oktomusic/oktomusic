import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { m3uToPlaylist, playlistToM3U } from "../src/m3u";

import { playlistM3U } from "./common";

const playlistFixturePath = resolve(__dirname, "./files/playlist.m3u");
const playlistFixture = readFileSync(playlistFixturePath, "utf8").trimEnd();

describe("M3U parser/generator", () => {
  it("generates the expected M3U output", () => {
    expect(playlistToM3U(playlistM3U)).toBe(playlistFixture);
  });

  it("parses the sample M3U file", () => {
    expect(m3uToPlaylist(playlistFixture, playlistM3U.name)).toEqual(
      playlistM3U,
    );
  });

  it("round-trips playlist data", () => {
    const parsed = m3uToPlaylist(playlistToM3U(playlistM3U), playlistM3U.name);

    expect(parsed).toEqual(playlistM3U);
  });

  it("throws when the header is missing", () => {
    expect(() =>
      m3uToPlaylist("#EXTINF:238,Phoenix\ntrack.flac", "Broken"),
    ).toThrow("Invalid M3U format: Missing #EXTM3U header");
  });

  it("throws when an EXTINF line is malformed", () => {
    expect(() =>
      m3uToPlaylist(
        "#EXTM3U\n#EXTINF:not-a-number,Phoenix\ntrack.flac",
        "Broken",
      ),
    ).toThrow("Invalid EXTINF line: #EXTINF:not-a-number,Phoenix");
  });

  it("throws when the file entry is missing after EXTINF", () => {
    expect(() =>
      m3uToPlaylist("#EXTM3U\n#EXTINF:238,Phoenix", "Broken"),
    ).toThrow("Unexpected end of M3U file after EXTINF line");
  });

  it("throws when a non-EXTINF line appears after the header", () => {
    expect(() => m3uToPlaylist("#EXTM3U\ntrack.flac", "Broken")).toThrow(
      "Unexpected line in M3U file: track.flac",
    );
  });
});
