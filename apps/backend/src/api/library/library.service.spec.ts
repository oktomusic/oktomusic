import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../db/prisma.service";
import { Role, type User } from "../../generated/prisma/client";
import { LibraryItemType, UserLibraryItemSource } from "./library.model";
import { LibraryService } from "./library.service";

type PrismaMock = {
  readonly album: {
    readonly findUnique: ReturnType<typeof vi.fn>;
    readonly findMany: ReturnType<typeof vi.fn>;
  };
  readonly playlist: {
    readonly findUnique: ReturnType<typeof vi.fn>;
    readonly findMany: ReturnType<typeof vi.fn>;
  };
  readonly userItemPlayHistory: {
    readonly upsert: ReturnType<typeof vi.fn>;
    readonly deleteMany: ReturnType<typeof vi.fn>;
    readonly findMany: ReturnType<typeof vi.fn>;
  };
  readonly userLibraryItem: {
    readonly findMany: ReturnType<typeof vi.fn>;
    readonly findUnique: ReturnType<typeof vi.fn>;
    readonly upsert: ReturnType<typeof vi.fn>;
    readonly deleteMany: ReturnType<typeof vi.fn>;
  };
};

const user: User = {
  id: "user-1",
  username: "alice",
  oidcSub: "oidc-sub-1",
  role: Role.USER,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  sex: null,
};

const createAlbum = (id: string, name: string) => ({
  id,
  name,
  date: null,
  artists: [
    {
      artistId: "artist-1",
      albumId: id,
      order: 0,
      artist: { id: "artist-1", name: "Artist" },
    },
  ],
  coverColorVibrant: "#111111",
  coverColorDarkVibrant: "#222222",
  coverColorLightVibrant: "#333333",
  coverColorMuted: "#444444",
  coverColorDarkMuted: "#555555",
  coverColorLightMuted: "#666666",
});

const createPlaylist = (
  id: string,
  name: string,
  userId: string,
  visibility: "PUBLIC" | "UNLISTED" | "PRIVATE" = "PUBLIC",
) => ({
  id,
  name,
  description: null,
  visibility,
  createdAt: new Date("2026-02-01T00:00:00.000Z"),
  user: { id: userId, username: userId === user.id ? "alice" : "bob" },
  playlistTracks: [
    {
      track: { albumId: "album-cover-1" },
    },
  ],
});

describe("LibraryService", () => {
  let service: LibraryService;
  let prisma: PrismaMock;

  const now = new Date("2026-06-13T10:15:30.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    prisma = {
      album: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      playlist: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      userItemPlayHistory: {
        upsert: vi.fn().mockResolvedValue({}),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
        findMany: vi.fn().mockResolvedValue([]),
      },
      userLibraryItem: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue({}),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };

    service = new LibraryService(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("records album plays in generic user item history", async () => {
    prisma.album.findUnique.mockResolvedValue({ id: "album-1" });

    await expect(
      service.recordItemPlay(user, {
        itemType: LibraryItemType.ALBUM,
        itemId: "album-1",
      }),
    ).resolves.toBe(true);

    expect(prisma.userItemPlayHistory.upsert).toHaveBeenCalledWith({
      where: {
        userId_itemType_itemId: {
          userId: "user-1",
          itemType: LibraryItemType.ALBUM,
          itemId: "album-1",
        },
      },
      create: {
        userId: "user-1",
        itemType: LibraryItemType.ALBUM,
        itemId: "album-1",
        lastPlayedAt: now,
      },
      update: {
        lastPlayedAt: now,
      },
    });
  });

  it("records playlist plays when the playlist is playable", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "user-2",
      visibility: "UNLISTED",
    });

    await expect(
      service.recordItemPlay(user, {
        itemType: LibraryItemType.PLAYLIST,
        itemId: "playlist-1",
      }),
    ).resolves.toBe(true);

    expect(prisma.userItemPlayHistory.upsert).toHaveBeenCalledWith({
      where: {
        userId_itemType_itemId: {
          userId: "user-1",
          itemType: LibraryItemType.PLAYLIST,
          itemId: "playlist-1",
        },
      },
      create: {
        userId: "user-1",
        itemType: LibraryItemType.PLAYLIST,
        itemId: "playlist-1",
        lastPlayedAt: now,
      },
      update: {
        lastPlayedAt: now,
      },
    });
  });

  it("clears user play history", async () => {
    await expect(service.clearItemPlay("user-1")).resolves.toBe(true);

    expect(prisma.userItemPlayHistory.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
  });

  it("adds an album to the explicit library", async () => {
    const album = createAlbum("album-1", "Album One");

    prisma.album.findUnique.mockResolvedValue({ id: "album-1" });
    prisma.album.findMany.mockResolvedValue([album]);
    prisma.playlist.findMany.mockResolvedValue([]);
    prisma.userLibraryItem.findMany.mockResolvedValue([
      {
        id: "library-item-1",
        userId: "user-1",
        itemType: LibraryItemType.ALBUM,
        itemId: "album-1",
        addedAt: new Date("2026-03-01T00:00:00.000Z"),
      },
    ]);

    const entry = await service.addLibraryItem(user, {
      itemType: LibraryItemType.ALBUM,
      itemId: "album-1",
    });

    expect(prisma.userLibraryItem.upsert).toHaveBeenCalledWith({
      where: {
        userId_itemType_itemId: {
          userId: "user-1",
          itemType: LibraryItemType.ALBUM,
          itemId: "album-1",
        },
      },
      create: {
        userId: "user-1",
        itemType: LibraryItemType.ALBUM,
        itemId: "album-1",
      },
      update: {},
    });
    expect(entry).toMatchObject({
      id: "library-item-1",
      itemType: LibraryItemType.ALBUM,
      itemId: "album-1",
      source: UserLibraryItemSource.SAVED,
      item: { id: "album-1", name: "Album One" },
    });
  });

  it("adds another user's public playlist to the explicit library", async () => {
    const playlist = createPlaylist("playlist-1", "Public Playlist", "user-2");

    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "user-2",
      visibility: "PUBLIC",
    });
    prisma.playlist.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([playlist]);
    prisma.userLibraryItem.findMany.mockResolvedValue([
      {
        id: "library-item-1",
        userId: "user-1",
        itemType: LibraryItemType.PLAYLIST,
        itemId: "playlist-1",
        addedAt: new Date("2026-03-01T00:00:00.000Z"),
      },
    ]);

    const entry = await service.addLibraryItem(user, {
      itemType: LibraryItemType.PLAYLIST,
      itemId: "playlist-1",
    });

    expect(entry).toMatchObject({
      id: "library-item-1",
      itemType: LibraryItemType.PLAYLIST,
      itemId: "playlist-1",
      source: UserLibraryItemSource.SAVED,
      item: { id: "playlist-1", name: "Public Playlist" },
    });
  });

  it("rejects saving own playlists", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: user.id,
      visibility: "PRIVATE",
    });

    await expect(
      service.addLibraryItem(user, {
        itemType: LibraryItemType.PLAYLIST,
        itemId: "playlist-1",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.userLibraryItem.upsert).not.toHaveBeenCalled();
  });

  it("rejects saving private playlists from other users", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "user-2",
      visibility: "PRIVATE",
    });

    await expect(
      service.addLibraryItem(user, {
        itemType: LibraryItemType.PLAYLIST,
        itemId: "playlist-1",
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prisma.userLibraryItem.upsert).not.toHaveBeenCalled();
  });

  it("removes explicit library items idempotently", async () => {
    await expect(
      service.removeLibraryItem(user, {
        itemType: LibraryItemType.ALBUM,
        itemId: "album-1",
      }),
    ).resolves.toBe(true);

    expect(prisma.userLibraryItem.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        itemType: LibraryItemType.ALBUM,
        itemId: "album-1",
      },
    });
  });

  it("checks whether albums are explicitly saved in the library", async () => {
    prisma.userLibraryItem.findUnique.mockResolvedValue({
      id: "library-item-1",
    });

    await expect(
      service.isInLibrary(user, {
        itemType: LibraryItemType.ALBUM,
        itemId: "album-1",
      }),
    ).resolves.toBe(true);

    expect(prisma.userLibraryItem.findUnique).toHaveBeenCalledWith({
      where: {
        userId_itemType_itemId: {
          userId: "user-1",
          itemType: LibraryItemType.ALBUM,
          itemId: "album-1",
        },
      },
      select: { id: true },
    });
  });

  it("treats owned playlists as library items", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      userId: "user-1",
    });

    await expect(
      service.isInLibrary(user, {
        itemType: LibraryItemType.PLAYLIST,
        itemId: "playlist-1",
      }),
    ).resolves.toBe(true);
  });

  it("checks whether other users' playlists are explicitly saved", async () => {
    prisma.userLibraryItem.findUnique.mockResolvedValue({
      id: "library-item-1",
    });
    prisma.playlist.findUnique.mockResolvedValue({
      userId: "user-2",
    });

    await expect(
      service.isInLibrary(user, {
        itemType: LibraryItemType.PLAYLIST,
        itemId: "playlist-1",
      }),
    ).resolves.toBe(true);
  });

  it("includes owned playlists virtually", async () => {
    const playlist = createPlaylist("playlist-1", "My Playlist", user.id);

    prisma.playlist.findMany
      .mockResolvedValueOnce([playlist])
      .mockResolvedValueOnce([playlist]);

    const library = await service.getMyLibrary(user);

    expect(library.items).toHaveLength(1);
    expect(library.items[0]).toMatchObject({
      id: "owned-playlist:playlist-1",
      itemType: LibraryItemType.PLAYLIST,
      itemId: "playlist-1",
      source: UserLibraryItemSource.OWNED_PLAYLIST,
      item: { id: "playlist-1", name: "My Playlist" },
    });
  });

  it("orders played items before never-played items, then by name", async () => {
    prisma.userLibraryItem.findMany.mockResolvedValue([
      {
        id: "library-item-1",
        userId: "user-1",
        itemType: LibraryItemType.ALBUM,
        itemId: "album-a",
        addedAt: new Date("2026-03-01T00:00:00.000Z"),
      },
      {
        id: "library-item-2",
        userId: "user-1",
        itemType: LibraryItemType.ALBUM,
        itemId: "album-b",
        addedAt: new Date("2026-03-01T00:00:00.000Z"),
      },
      {
        id: "library-item-3",
        userId: "user-1",
        itemType: LibraryItemType.ALBUM,
        itemId: "album-c",
        addedAt: new Date("2026-03-01T00:00:00.000Z"),
      },
    ]);
    prisma.playlist.findMany.mockResolvedValue([]);
    prisma.album.findMany.mockResolvedValue([
      createAlbum("album-a", "Zulu"),
      createAlbum("album-b", "Alpha"),
      createAlbum("album-c", "Beta"),
    ]);
    prisma.userItemPlayHistory.findMany.mockResolvedValue([
      {
        userId: "user-1",
        itemType: LibraryItemType.ALBUM,
        itemId: "album-c",
        lastPlayedAt: new Date("2026-04-01T00:00:00.000Z"),
      },
    ]);

    const library = await service.getMyLibrary(user);

    expect(library.items.map((item) => item.itemId)).toEqual([
      "album-c",
      "album-b",
      "album-a",
    ]);
  });
});
