import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../db/prisma.service";
import {
  PlaylistVisibility as PrismaPlaylistVisibility,
  Role,
  type User,
} from "../../generated/prisma/client";
import type { TrackService } from "../track/track.service";
import { PlaylistService } from "./playlist.service";
import { PlaylistVisibility } from "./playlist-visibility.enum";

type PrismaMock = {
  readonly playlist: {
    readonly findUnique: ReturnType<typeof vi.fn>;
    readonly create: ReturnType<typeof vi.fn>;
    readonly update: ReturnType<typeof vi.fn>;
    readonly delete: ReturnType<typeof vi.fn>;
  };
  readonly track: {
    readonly count: ReturnType<typeof vi.fn>;
  };
  readonly playlistTrack: {
    readonly count: ReturnType<typeof vi.fn>;
    readonly findMany: ReturnType<typeof vi.fn>;
    readonly findFirst: ReturnType<typeof vi.fn>;
    readonly update: ReturnType<typeof vi.fn>;
    readonly createMany: ReturnType<typeof vi.fn>;
    readonly deleteMany: ReturnType<typeof vi.fn>;
  };
  readonly $transaction: ReturnType<typeof vi.fn>;
};

type PlaylistTrackTx = {
  readonly playlistTrack: PrismaMock["playlistTrack"];
};

describe("PlaylistService", () => {
  let service: PlaylistService;
  let prisma: PrismaMock;
  let trackService: { readonly mapTrack: ReturnType<typeof vi.fn> };

  const makeUser = (role: Role, id = "user-1"): User => ({
    id,
    username: "tester",
    oidcSub: "oidc-sub",
    role,
    sex: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  });

  beforeEach(() => {
    prisma = {
      playlist: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      track: {
        count: vi.fn(),
      },
      playlistTrack: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        createMany: vi.fn(),
        deleteMany: vi.fn(),
      },
      $transaction: vi.fn((callback: (tx: PlaylistTrackTx) => unknown) =>
        callback({
          playlistTrack: prisma.playlistTrack,
        }),
      ),
    };

    trackService = {
      mapTrack: vi.fn().mockReturnValue({
        id: "track-1",
        name: "Track 1",
        durationMs: 123,
      }),
    };

    service = new PlaylistService(
      prisma as unknown as PrismaService,
      trackService as unknown as TrackService,
    );
  });

  it("getPlaylist throws when playlist is missing", async () => {
    prisma.playlist.findUnique.mockResolvedValue(null);

    await expect(
      service.getPlaylist("missing", makeUser(Role.USER)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("getPlaylist forbids private playlist from another user for non-admin", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "owner-1",
      name: "p",
      description: null,
      visibility: PrismaPlaylistVisibility.PRIVATE,
      createdAt: new Date(),
      updatedAt: new Date(),
      playlistTracks: [],
    });

    await expect(
      service.getPlaylist("playlist-1", makeUser(Role.USER, "other-user")),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("getPlaylist maps playlist tracks for owner", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "user-1",
      name: "playlist",
      description: "desc",
      visibility: PrismaPlaylistVisibility.PUBLIC,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      playlistTracks: [
        {
          position: 0,
          addedAt: new Date("2026-01-01T00:00:00.000Z"),
          track: { id: "track-1" },
        },
      ],
    });

    const result = await service.getPlaylist("playlist-1", makeUser(Role.USER));

    expect(result.visibility).toBe(PlaylistVisibility.PUBLIC);
    expect(result.tracks).toHaveLength(1);
    expect(trackService.mapTrack).toHaveBeenCalledTimes(1);
  });

  it("createPlaylist allows admin creating for another user", async () => {
    prisma.playlist.create.mockResolvedValue({
      id: "playlist-1",
      name: "My playlist",
      description: null,
      visibility: PrismaPlaylistVisibility.PRIVATE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.createPlaylist(
      {
        name: "My playlist",
        userId: "target-user",
      },
      makeUser(Role.ADMIN),
    );

    const createCall = prisma.playlist.create.mock.calls[0];
    expect(createCall).toBeDefined();
    expect(createCall?.[0]).toMatchObject({
      data: {
        userId: "target-user",
      },
    });
  });

  it("updatePlaylist throws when updating another user playlist as non-admin", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "owner-1",
    });

    await expect(
      service.updatePlaylist("playlist-1", makeUser(Role.USER, "other-user"), {
        name: "new",
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("deletePlaylist allows admin deleting another user playlist", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "owner-1",
    });

    await service.deletePlaylist("playlist-1", makeUser(Role.ADMIN, "admin-1"));

    expect(prisma.playlist.delete).toHaveBeenCalledWith({
      where: { id: "playlist-1" },
    });
  });

  it("addTracksToPlaylist throws for empty trackIds", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "user-1",
    });

    await expect(
      service.addTracksToPlaylist("playlist-1", makeUser(Role.USER), []),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("addTracksToPlaylist inserts and shifts tracks in transaction", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "user-1",
    });
    prisma.track.count.mockResolvedValue(2);
    prisma.playlistTrack.count.mockResolvedValue(3);
    prisma.playlistTrack.findMany.mockResolvedValue([
      { id: "pt-3", position: 2 },
      { id: "pt-2", position: 1 },
    ]);

    await service.addTracksToPlaylist(
      "playlist-1",
      makeUser(Role.USER),
      ["track-1", "track-2"],
      1,
    );

    expect(prisma.playlistTrack.update).toHaveBeenCalledTimes(2);
    expect(prisma.playlistTrack.createMany).toHaveBeenCalledWith({
      data: [
        { playlistId: "playlist-1", trackId: "track-1", position: 1 },
        { playlistId: "playlist-1", trackId: "track-2", position: 2 },
      ],
    });
  });

  it("reorderPlaylistTracks validates positions", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "user-1",
    });
    prisma.playlistTrack.count.mockResolvedValue(2);

    await expect(
      service.reorderPlaylistTracks("playlist-1", makeUser(Role.USER), -1, 1),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("reorderPlaylistTracks throws when playlist is missing", async () => {
    prisma.playlist.findUnique.mockResolvedValue(null);

    await expect(
      service.reorderPlaylistTracks("missing", makeUser(Role.USER), 0, 1),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("reorderPlaylistTracks forbids non-owner non-admin", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "owner-1",
    });

    await expect(
      service.reorderPlaylistTracks(
        "playlist-1",
        makeUser(Role.USER, "other-user"),
        0,
        1,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("reorderPlaylistTracks validates count", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "user-1",
    });
    prisma.playlistTrack.count.mockResolvedValue(3);

    await expect(
      service.reorderPlaylistTracks("playlist-1", makeUser(Role.USER), 0, 1, 0),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("reorderPlaylistTracks moves a track forward", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "user-1",
    });
    prisma.playlistTrack.count.mockResolvedValue(4);
    prisma.playlistTrack.findMany.mockResolvedValue([
      { id: "pt-0", position: 0 },
      { id: "pt-1", position: 1 },
      { id: "pt-2", position: 2 },
      { id: "pt-3", position: 3 },
    ]);

    await service.reorderPlaylistTracks(
      "playlist-1",
      makeUser(Role.USER),
      1,
      3,
    );

    expect(prisma.playlistTrack.update).toHaveBeenCalledTimes(8);
  });

  it("reorderPlaylistTracks moves multiple tracks with count", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "user-1",
    });
    prisma.playlistTrack.count.mockResolvedValue(5);
    prisma.playlistTrack.findMany.mockResolvedValue([
      { id: "pt-0", position: 0 },
      { id: "pt-1", position: 1 },
      { id: "pt-2", position: 2 },
      { id: "pt-3", position: 3 },
      { id: "pt-4", position: 4 },
    ]);

    await service.reorderPlaylistTracks(
      "playlist-1",
      makeUser(Role.USER),
      1,
      3,
      2,
    );

    expect(prisma.playlistTrack.update).toHaveBeenCalledTimes(10);
  });

  it("reorderPlaylistTracks no-ops when destination is inside moved block", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "user-1",
    });
    prisma.playlistTrack.count.mockResolvedValue(5);

    await service.reorderPlaylistTracks(
      "playlist-1",
      makeUser(Role.USER),
      1,
      2,
      2,
    );

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.playlistTrack.update).not.toHaveBeenCalled();
  });

  it("removeTracksFromPlaylist validates selected positions", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "user-1",
    });
    prisma.playlistTrack.count.mockResolvedValue(2);

    await expect(
      service.removeTracksFromPlaylist(
        "playlist-1",
        makeUser(Role.USER),
        [0, 2],
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("removeTracksFromPlaylist throws when playlist is missing", async () => {
    prisma.playlist.findUnique.mockResolvedValue(null);

    await expect(
      service.removeTracksFromPlaylist("missing", makeUser(Role.USER), [0]),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("removeTracksFromPlaylist forbids non-owner non-admin", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "owner-1",
    });

    await expect(
      service.removeTracksFromPlaylist(
        "playlist-1",
        makeUser(Role.USER, "other-user"),
        [0],
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("removeTracksFromPlaylist validates empty positions array", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "user-1",
    });

    await expect(
      service.removeTracksFromPlaylist("playlist-1", makeUser(Role.USER), []),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("removeTracksFromPlaylist deletes and compacts positions", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "user-1",
    });
    prisma.playlistTrack.count.mockResolvedValue(4);
    prisma.playlistTrack.findMany.mockResolvedValueOnce([
      { id: "pt-1" },
      { id: "pt-4" },
    ]);

    await service.removeTracksFromPlaylist(
      "playlist-1",
      makeUser(Role.USER),
      [1, 2],
    );

    expect(prisma.playlistTrack.deleteMany).toHaveBeenCalledWith({
      where: {
        playlistId: "playlist-1",
        position: { in: [1, 2] },
      },
    });
    expect(prisma.playlistTrack.update).toHaveBeenCalledTimes(2);
  });

  it("removeTracksFromPlaylist deduplicates positions before delete", async () => {
    prisma.playlist.findUnique.mockResolvedValue({
      id: "playlist-1",
      userId: "user-1",
    });
    prisma.playlistTrack.count.mockResolvedValue(4);
    prisma.playlistTrack.findMany.mockResolvedValueOnce([
      { id: "pt-0" },
      { id: "pt-3" },
    ]);

    await service.removeTracksFromPlaylist(
      "playlist-1",
      makeUser(Role.USER),
      [1, 1, 2],
    );

    expect(prisma.playlistTrack.deleteMany).toHaveBeenCalledWith({
      where: {
        playlistId: "playlist-1",
        position: { in: [1, 2] },
      },
    });
  });
});
