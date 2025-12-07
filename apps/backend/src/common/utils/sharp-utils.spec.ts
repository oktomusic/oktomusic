import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("fs/promises", () => {
  return {
    default: {
      stat: vi.fn(),
      access: vi.fn(),
      constants: { R_OK: 4 },
    },
  };
});

vi.mock("path", () => {
  return {
    default: {
      resolve: (...parts: string[]) => parts.join("/"),
    },
  };
});

import { pickAlbumCoverCandidate } from "./sharp-utils";

import fs from "fs/promises";

describe("pickAlbumCoverCandidate", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no candidate files exist", async () => {
    vi.mocked(fs.stat).mockImplementation(() => {
      throw new Error("not found");
    });

    const result = await pickAlbumCoverCandidate("/music/album1");
    expect(result).toBeNull();
  });

  it("picks the first readable candidate in priority order", async () => {
    // Simulate: PNG missing, AVIF present and readable
    const files = new Map<string, { isFile: () => boolean }>();
    files.set("/music/album1/cover.avif", { isFile: () => true });

    vi.mocked(fs.stat).mockImplementation((candidatePath: string) => {
      const entry = files.get(candidatePath);
      if (!entry) throw new Error("not found");
      return Promise.resolve(
        entry as unknown as Awaited<ReturnType<typeof fs.stat>>,
      );
    });

    vi.mocked(fs.access).mockResolvedValue(true as unknown as void);

    const result = await pickAlbumCoverCandidate("/music/album1");
    expect(result).toBe("/music/album1/cover.avif");
  });

  it("falls back to jpg/jpeg when higher-priority files missing", async () => {
    const files = new Map<string, { isFile: () => boolean }>();
    files.set("/music/album1/cover.jpg", { isFile: () => true });

    vi.mocked(fs.stat).mockImplementation((candidatePath: string) => {
      const entry = files.get(candidatePath);
      if (!entry) throw new Error("not found");
      return Promise.resolve(
        entry as unknown as Awaited<ReturnType<typeof fs.stat>>,
      );
    });

    vi.mocked(fs.access).mockResolvedValue(true as unknown as void);

    const result = await pickAlbumCoverCandidate("/music/album1");
    expect(result).toBe("/music/album1/cover.jpg");
  });

  it("skips non-readable files (access denied)", async () => {
    const files = new Map<string, { isFile: () => boolean }>();
    files.set("/music/album1/cover.png", { isFile: () => true });
    files.set("/music/album1/cover.avif", { isFile: () => true });

    vi.mocked(fs.stat).mockImplementation((candidatePath: string) => {
      const entry = files.get(candidatePath);
      if (!entry) throw new Error("not found");
      return Promise.resolve(
        entry as unknown as Awaited<ReturnType<typeof fs.stat>>,
      );
    });

    // First candidate not readable, second is readable
    vi.mocked(fs.access).mockImplementation((candidatePath: string) => {
      if (candidatePath.endsWith("cover.png")) throw new Error("EACCES");
      return Promise.resolve(true as unknown as void);
    });

    const result = await pickAlbumCoverCandidate("/music/album1");
    expect(result).toBe("/music/album1/cover.avif");
  });
});
