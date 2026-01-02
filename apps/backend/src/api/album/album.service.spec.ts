import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import type { AppConfig } from "../../config/definitions/app.config";

describe("AlbumService", () => {
  const intermediatePath = "/tmp/oktomusic-intermediate";

  const appConf: AppConfig = {
    env: "test",
    databaseUrl: "postgresql://unused",
    isDev: false,
    isProd: false,
    isTest: true,
    sessionSecret: "unused",
    libraryPath: "/tmp/oktomusic-library",
    intermediatePath,
    ffmpegPath: undefined,
    ffprobePath: undefined,
    metaflacPath: undefined,
  };

  const setup = async () => {
    vi.resetModules();

    const existsSync = vi.fn<(p: string) => boolean>();
    vi.doMock("node:fs", () => {
      return {
        existsSync,
        default: {
          existsSync,
        },
      };
    });

    const { AlbumService } = await import("./album.service.js");
    const service = new AlbumService(appConf);

    return { existsSync, service };
  };

  it("returns null when album directory does not exist", async () => {
    const { existsSync, service } = await setup();

    existsSync
      .mockReturnValueOnce(false) // albumDir
      .mockReturnValueOnce(true); // coverPath (should not be reached)

    expect(service.findAlbumCoverPath("cuid123", "128")).toBeNull();

    expect(existsSync).toHaveBeenCalledTimes(1);
    expect(existsSync).toHaveBeenCalledWith(
      path.resolve(intermediatePath, "albums", "cuid123"),
    );
  });

  it("returns null when cover file does not exist", async () => {
    const { existsSync, service } = await setup();

    existsSync
      .mockReturnValueOnce(true) // albumDir
      .mockReturnValueOnce(false); // coverPath

    expect(service.findAlbumCoverPath("cuid123", "128")).toBeNull();

    expect(existsSync).toHaveBeenCalledTimes(2);
    expect(existsSync).toHaveBeenNthCalledWith(
      1,
      path.resolve(intermediatePath, "albums", "cuid123"),
    );
    expect(existsSync).toHaveBeenNthCalledWith(
      2,
      path.resolve(intermediatePath, "albums", "cuid123", "cover_128.avif"),
    );
  });

  it("returns absolute cover path when directory and cover exist", async () => {
    const { existsSync, service } = await setup();

    existsSync
      .mockReturnValueOnce(true) // albumDir
      .mockReturnValueOnce(true); // coverPath

    expect(service.findAlbumCoverPath("cuid123", "128")).toBe(
      path.resolve(intermediatePath, "albums", "cuid123", "cover_128.avif"),
    );

    expect(existsSync).toHaveBeenCalledTimes(2);
  });
});
