import fs from "node:fs/promises";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { parseLRCtoLyrics, parseTTMLtoLyrics } from "@oktomusic/lyrics";

import { findAndParseLyrics } from "./indexing.lyrics.utils";

function toPathString(p: unknown): string {
  if (typeof p === "string") return p;
  if (p instanceof URL) return p.pathname;
  if (p instanceof Uint8Array) return Buffer.from(p).toString("utf8");
  return "";
}

vi.mock("node:fs/promises", () => {
  return {
    default: {
      readFile: vi.fn(),
    },
  };
});

vi.mock("@oktomusic/lyrics", () => {
  return {
    parseTTMLtoLyrics: vi.fn(),
    parseLRCtoLyrics: vi.fn(),
  };
});

describe("indexing.lyrics.utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null with no error when no lyrics file exists", async () => {
    vi.mocked(fs.readFile).mockRejectedValue(
      Object.assign(new Error("not found"), { code: "ENOENT" }),
    );

    const res = await findAndParseLyrics("/music/Album/01 - Track.flac");

    expect(res).toEqual({ lyrics: null });
    expect(vi.mocked(parseTTMLtoLyrics)).not.toHaveBeenCalled();
    expect(vi.mocked(parseLRCtoLyrics)).not.toHaveBeenCalled();
  });

  it("prefers TTML over LRC", async () => {
    vi.mocked(fs.readFile).mockImplementation((filePath) => {
      const p = toPathString(filePath);
      if (p.endsWith(".ttml")) return Promise.resolve(Buffer.from("<tt/>"));
      if (p.endsWith(".lrc"))
        return Promise.resolve(Buffer.from("[00:01.00]x"));
      throw Object.assign(new Error("not found"), { code: "ENOENT" });
    });

    vi.mocked(parseTTMLtoLyrics).mockReturnValue([
      { ts: 1, te: 2, t: "ttml", l: [{ c: "ttml", d: 1 }] },
    ]);

    const res = await findAndParseLyrics("/music/Album/01 - Track.flac");

    expect(res.lyrics?.[0]?.t).toBe("ttml");
    expect(vi.mocked(parseTTMLtoLyrics)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(parseLRCtoLyrics)).not.toHaveBeenCalled();
  });

  it("falls back to LRC when TTML is missing", async () => {
    vi.mocked(fs.readFile).mockImplementation((filePath) => {
      const p = toPathString(filePath);
      if (p.endsWith(".ttml"))
        return Promise.reject(
          Object.assign(new Error("not found"), { code: "ENOENT" }),
        );
      if (p.endsWith(".lrc"))
        return Promise.resolve(Buffer.from("[00:01.00]x"));
      throw Object.assign(new Error("not found"), { code: "ENOENT" });
    });

    vi.mocked(parseLRCtoLyrics).mockReturnValue([
      { ts: 1, te: 2, t: "lrc", l: [{ c: "lrc", d: 1 }] },
    ]);

    const res = await findAndParseLyrics("/music/Album/01 - Track.flac");

    expect(res.lyrics?.[0]?.t).toBe("lrc");
    expect(vi.mocked(parseTTMLtoLyrics)).not.toHaveBeenCalled();
    expect(vi.mocked(parseLRCtoLyrics)).toHaveBeenCalledTimes(1);
  });

  it("returns an error (and no fallback) when TTML exists but cannot be parsed", async () => {
    vi.mocked(fs.readFile).mockImplementation((filePath) => {
      const p = toPathString(filePath);
      if (p.endsWith(".ttml")) return Promise.resolve(Buffer.from("<tt/>"));
      if (p.endsWith(".lrc"))
        return Promise.resolve(Buffer.from("[00:01.00]x"));
      throw Object.assign(new Error("not found"), { code: "ENOENT" });
    });

    vi.mocked(parseTTMLtoLyrics).mockImplementation(() => {
      throw new Error("bad ttml");
    });

    const res = await findAndParseLyrics("/music/Album/01 - Track.flac");

    expect(res.lyrics).toBeNull();
    expect(res.error?.filePath).toBe("/music/Album/01 - Track.ttml");
    expect(res.error?.message).toContain("bad ttml");
    expect(vi.mocked(parseLRCtoLyrics)).not.toHaveBeenCalled();
  });

  it("returns an error when LRC exists but cannot be parsed", async () => {
    vi.mocked(fs.readFile).mockImplementation((filePath) => {
      const p = toPathString(filePath);
      if (p.endsWith(".ttml"))
        return Promise.reject(
          Object.assign(new Error("not found"), { code: "ENOENT" }),
        );
      if (p.endsWith(".lrc"))
        return Promise.resolve(Buffer.from("[00:01.00]x"));
      throw Object.assign(new Error("not found"), { code: "ENOENT" });
    });

    vi.mocked(parseLRCtoLyrics).mockImplementation(() => {
      throw new Error("bad lrc");
    });

    const res = await findAndParseLyrics("/music/Album/01 - Track.flac");

    expect(res.lyrics).toBeNull();
    expect(res.error?.filePath).toBe("/music/Album/01 - Track.lrc");
    expect(res.error?.message).toContain("bad lrc");
  });
});
