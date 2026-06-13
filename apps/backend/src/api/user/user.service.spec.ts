import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../db/prisma.service";
import { UserService } from "./user.service";

type PrismaMock = {
  readonly userPlayHistoryAlbum: {
    readonly upsert: ReturnType<typeof vi.fn>;
  };
  readonly userPlayHistoryPlaylist: {
    readonly upsert: ReturnType<typeof vi.fn>;
  };
};

describe("UserService", () => {
  let service: UserService;
  let prisma: PrismaMock;

  const now = new Date("2026-06-13T10:15:30.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    prisma = {
      userPlayHistoryAlbum: {
        upsert: vi.fn().mockResolvedValue({}),
      },
      userPlayHistoryPlaylist: {
        upsert: vi.fn().mockResolvedValue({}),
      },
    };

    service = new UserService(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("records album plays in user play history", async () => {
    await expect(
      service.recordItemPlay("user-1", "ALBUM", "album-1"),
    ).resolves.toBe(true);

    expect(prisma.userPlayHistoryAlbum.upsert).toHaveBeenCalledWith({
      where: {
        userId_albumId: {
          userId: "user-1",
          albumId: "album-1",
        },
      },
      create: {
        userId: "user-1",
        albumId: "album-1",
        lastPlayedAt: now,
      },
      update: {
        lastPlayedAt: now,
      },
    });
    expect(prisma.userPlayHistoryPlaylist.upsert).not.toHaveBeenCalled();
  });

  it("records playlist plays in user play history", async () => {
    await expect(
      service.recordItemPlay("user-1", "PLAYLIST", "playlist-1"),
    ).resolves.toBe(true);

    expect(prisma.userPlayHistoryPlaylist.upsert).toHaveBeenCalledWith({
      where: {
        userId_playlistId: {
          userId: "user-1",
          playlistId: "playlist-1",
        },
      },
      create: {
        userId: "user-1",
        playlistId: "playlist-1",
        lastPlayedAt: now,
      },
      update: {
        lastPlayedAt: now,
      },
    });
    expect(prisma.userPlayHistoryAlbum.upsert).not.toHaveBeenCalled();
  });
});
