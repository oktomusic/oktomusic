import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import type { AppConfig } from "../../config/definitions/app.config";

describe("AlbumService", () => {
  const intermediatePath = "/tmp/oktomusic-intermediate";

  const appConf: AppConfig = {
    env: "test",
    appName: "Oktomusic",
    appShortName: "Oktomusic",
    publicUrl: undefined,
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
    const statSync = vi.fn((filePath: string) => {
      const isCover = filePath.endsWith(".avif");

      return {
        isFile: () => isCover,
        isDirectory: () => !isCover,
      };
    });
    vi.doMock("node:fs", () => {
      return {
        existsSync,
        statSync,
        default: {
          existsSync,
          statSync,
        },
      };
    });

    const { AlbumService } = await import("./album.service.js");
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      album: {
        findMany,
      },
    };
    const service = new AlbumService(
      appConf,
      prisma as unknown as ConstructorParameters<typeof AlbumService>[1],
    );

    return { existsSync, findMany, service };
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

  it("does not cap album searches when no limit is supplied", async () => {
    const { findMany, service } = await setup();

    await service.searchAlbums({});

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ name: "asc" }],
        skip: 0,
        take: undefined,
      }),
    );
  });

  it("honors explicit album search filters and limits", async () => {
    const { findMany, service } = await setup();

    await service.searchAlbums({
      artistId: "artist-1",
      limit: 25,
      name: "Kind",
      offset: 5,
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ name: "asc" }],
        skip: 5,
        take: 25,
        where: {
          artists: { some: { artistId: "artist-1" } },
          name: { contains: "Kind", mode: "insensitive" },
        },
      }),
    );
  });
});
