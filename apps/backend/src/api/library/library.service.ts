import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import {
  PlaylistVisibility as PrismaPlaylistVisibility,
  Prisma,
  Role,
  type User,
} from "../../generated/prisma/client";
import { PrismaService } from "../../db/prisma.service";
import { AlbumBasicModel } from "../album/album.model";
import { PlaylistBasicModel } from "../playlist/playlist.model";
import { getCoverAlbumIds } from "../playlist/playlist-cover.utils";
import { PlaylistVisibility } from "../playlist/playlist-visibility.enum";
import {
  LibraryItemType,
  UserLibraryEntryModel,
  UserLibraryItemSource,
  UserLibraryModel,
} from "./library.model";

interface LibraryItemRef {
  itemType: LibraryItemType;
  itemId: string;
}

const albumBasicSelect = {
  id: true,
  name: true,
  date: true,
  coverColorVibrant: true,
  coverColorDarkVibrant: true,
  coverColorLightVibrant: true,
  coverColorMuted: true,
  coverColorDarkMuted: true,
  coverColorLightMuted: true,
  artists: {
    include: { artist: true },
    orderBy: { order: "asc" as const },
  },
} as const satisfies Prisma.AlbumSelect;

const playlistLibrarySelect = {
  id: true,
  name: true,
  description: true,
  visibility: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      username: true,
    },
  },
  playlistTracks: {
    select: {
      track: { select: { albumId: true } },
    },
    orderBy: { position: "asc" as const },
  },
} as const satisfies Prisma.PlaylistSelect;

type AlbumBasicPayload = Prisma.AlbumGetPayload<{
  select: typeof albumBasicSelect;
}>;

type PlaylistLibraryPayload = Prisma.PlaylistGetPayload<{
  select: typeof playlistLibrarySelect;
}>;

@Injectable()
export class LibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyLibrary(user: User): Promise<UserLibraryModel> {
    const [savedItems, ownedPlaylists] = await Promise.all([
      this.prisma.userLibraryItem.findMany({
        where: { userId: user.id },
        orderBy: { addedAt: "desc" },
      }),
      this.prisma.playlist.findMany({
        where: { userId: user.id },
        select: playlistLibrarySelect,
      }),
    ]);

    const refs: LibraryItemRef[] = [
      ...savedItems.map((item) => ({
        itemType: item.itemType,
        itemId: item.itemId,
      })),
      ...ownedPlaylists.map((playlist) => ({
        itemType: LibraryItemType.PLAYLIST,
        itemId: playlist.id,
      })),
    ];

    const [albumMap, playlistMap, lastPlayedAtMap] = await Promise.all([
      this.getAlbumMap(
        refs
          .filter((ref) => ref.itemType === LibraryItemType.ALBUM)
          .map((ref) => ref.itemId),
      ),
      this.getPlaylistMap(
        user.id,
        refs
          .filter((ref) => ref.itemType === LibraryItemType.PLAYLIST)
          .map((ref) => ref.itemId),
      ),
      this.getLastPlayedAtMap(user.id, refs),
    ]);

    const entriesByKey = new Map<string, UserLibraryEntryModel>();

    for (const savedItem of savedItems) {
      const itemType = savedItem.itemType;
      const key = this.getRefKey({ itemType, itemId: savedItem.itemId });
      const item =
        itemType === LibraryItemType.ALBUM
          ? albumMap.get(savedItem.itemId)
          : playlistMap.get(savedItem.itemId)?.playlist;

      if (!item) {
        continue;
      }

      entriesByKey.set(key, {
        id: savedItem.id,
        itemType,
        itemId: savedItem.itemId,
        source: UserLibraryItemSource.SAVED,
        item,
        addedAt: savedItem.addedAt,
        lastPlayedAt: lastPlayedAtMap.get(key) ?? null,
      });
    }

    for (const playlist of ownedPlaylists) {
      const key = this.getRefKey({
        itemType: LibraryItemType.PLAYLIST,
        itemId: playlist.id,
      });
      const playlistEntry = playlistMap.get(playlist.id);

      if (!playlistEntry) {
        continue;
      }

      entriesByKey.set(key, {
        id: `owned-playlist:${playlist.id}`,
        itemType: LibraryItemType.PLAYLIST,
        itemId: playlist.id,
        source: UserLibraryItemSource.OWNED_PLAYLIST,
        item: playlistEntry.playlist,
        addedAt: playlist.createdAt,
        lastPlayedAt: lastPlayedAtMap.get(key) ?? null,
      });
    }

    const items = Array.from(entriesByKey.values()).sort((a, b) =>
      this.compareLibraryEntries(a, b),
    );

    return { items };
  }

  async addLibraryItem(
    user: User,
    ref: LibraryItemRef,
  ): Promise<UserLibraryEntryModel> {
    await this.assertItemCanBeSaved(user, ref);

    await this.prisma.userLibraryItem.upsert({
      where: {
        userId_itemType_itemId: {
          userId: user.id,
          itemType: ref.itemType,
          itemId: ref.itemId,
        },
      },
      create: {
        userId: user.id,
        itemType: ref.itemType,
        itemId: ref.itemId,
      },
      update: {},
    });

    const library = await this.getMyLibrary(user);
    const entry = library.items.find((item) => this.isSameRef(item, ref));

    if (!entry) {
      throw new NotFoundException("Library item not found");
    }

    return entry;
  }

  async removeLibraryItem(user: User, ref: LibraryItemRef): Promise<boolean> {
    await this.prisma.userLibraryItem.deleteMany({
      where: {
        userId: user.id,
        itemType: ref.itemType,
        itemId: ref.itemId,
      },
    });

    return true;
  }

  async isInLibrary(user: User, ref: LibraryItemRef): Promise<boolean> {
    switch (ref.itemType) {
      case LibraryItemType.ALBUM:
        return this.isExplicitlySaved(user.id, ref);
      case LibraryItemType.PLAYLIST: {
        const [saved, playlist] = await Promise.all([
          this.isExplicitlySaved(user.id, ref),
          this.prisma.playlist.findUnique({
            where: { id: ref.itemId },
            select: { userId: true },
          }),
        ]);

        return saved || playlist?.userId === user.id;
      }
      default:
        this.assertNever();
    }
  }

  async recordItemPlay(user: User, ref: LibraryItemRef): Promise<boolean> {
    await this.assertItemCanBePlayed(user, ref);

    const lastPlayedAt = new Date();

    await this.prisma.userItemPlayHistory.upsert({
      where: {
        userId_itemType_itemId: {
          userId: user.id,
          itemType: ref.itemType,
          itemId: ref.itemId,
        },
      },
      create: {
        userId: user.id,
        itemType: ref.itemType,
        itemId: ref.itemId,
        lastPlayedAt,
      },
      update: {
        lastPlayedAt,
      },
    });

    return true;
  }

  async clearItemPlay(userId: string): Promise<boolean> {
    await this.prisma.userItemPlayHistory.deleteMany({
      where: { userId },
    });

    return true;
  }

  private async assertItemCanBeSaved(
    user: User,
    ref: LibraryItemRef,
  ): Promise<void> {
    switch (ref.itemType) {
      case LibraryItemType.ALBUM:
        await this.assertAlbumExists(ref.itemId);
        return;
      case LibraryItemType.PLAYLIST:
        await this.assertPlaylistCanBeSaved(user, ref.itemId);
        return;
      default:
        this.assertNever();
    }
  }

  private async assertItemCanBePlayed(
    user: User,
    ref: LibraryItemRef,
  ): Promise<void> {
    switch (ref.itemType) {
      case LibraryItemType.ALBUM:
        await this.assertAlbumExists(ref.itemId);
        return;
      case LibraryItemType.PLAYLIST:
        await this.assertPlaylistCanBePlayed(user, ref.itemId);
        return;
      default:
        this.assertNever();
    }
  }

  private async isExplicitlySaved(
    userId: string,
    ref: LibraryItemRef,
  ): Promise<boolean> {
    const savedItem = await this.prisma.userLibraryItem.findUnique({
      where: {
        userId_itemType_itemId: {
          userId,
          itemType: ref.itemType,
          itemId: ref.itemId,
        },
      },
      select: { id: true },
    });

    return savedItem !== null;
  }

  private async assertAlbumExists(albumId: string): Promise<void> {
    const album = await this.prisma.album.findUnique({
      where: { id: albumId },
      select: { id: true },
    });

    if (!album) {
      throw new NotFoundException("Library item not found");
    }
  }

  private async assertPlaylistCanBeSaved(
    user: User,
    playlistId: string,
  ): Promise<void> {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      select: { id: true, userId: true, visibility: true },
    });

    if (!playlist) {
      throw new NotFoundException("Library item not found");
    }

    if (playlist.userId === user.id) {
      throw new BadRequestException("Own playlists are already in the library");
    }

    if (playlist.visibility === PrismaPlaylistVisibility.PRIVATE) {
      throw new ForbiddenException("Private playlists cannot be saved");
    }
  }

  private async assertPlaylistCanBePlayed(
    user: User,
    playlistId: string,
  ): Promise<void> {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      select: { id: true, userId: true, visibility: true },
    });

    if (!playlist) {
      throw new NotFoundException("Library item not found");
    }

    const canPlay =
      playlist.userId === user.id ||
      user.role === Role.ADMIN ||
      playlist.visibility !== PrismaPlaylistVisibility.PRIVATE;

    if (!canPlay) {
      throw new ForbiddenException("You cannot play this playlist");
    }
  }

  private async getAlbumMap(
    albumIds: readonly string[],
  ): Promise<Map<string, AlbumBasicModel>> {
    const uniqueAlbumIds = [...new Set(albumIds)];

    if (uniqueAlbumIds.length === 0) {
      return new Map();
    }

    const albums = await this.prisma.album.findMany({
      where: { id: { in: uniqueAlbumIds } },
      select: albumBasicSelect,
    });

    return new Map(
      albums.map((album) => [album.id, this.mapAlbumBasic(album)]),
    );
  }

  private async getPlaylistMap(
    userId: string,
    playlistIds: readonly string[],
  ): Promise<Map<string, { playlist: PlaylistBasicModel; createdAt: Date }>> {
    const uniquePlaylistIds = [...new Set(playlistIds)];

    if (uniquePlaylistIds.length === 0) {
      return new Map();
    }

    const playlists = await this.prisma.playlist.findMany({
      where: {
        id: { in: uniquePlaylistIds },
        OR: [
          { userId },
          {
            visibility: {
              in: [
                PrismaPlaylistVisibility.PUBLIC,
                PrismaPlaylistVisibility.UNLISTED,
              ],
            },
          },
        ],
      },
      select: playlistLibrarySelect,
    });

    return new Map(
      playlists.map((playlist) => [
        playlist.id,
        {
          playlist: this.mapPlaylistBasic(playlist),
          createdAt: playlist.createdAt,
        },
      ]),
    );
  }

  private async getLastPlayedAtMap(
    userId: string,
    refs: readonly LibraryItemRef[],
  ): Promise<Map<string, Date>> {
    const uniqueRefs = Array.from(
      new Map(refs.map((ref) => [this.getRefKey(ref), ref])).values(),
    );

    if (uniqueRefs.length === 0) {
      return new Map();
    }

    const playHistory = await this.prisma.userItemPlayHistory.findMany({
      where: {
        userId,
        OR: uniqueRefs.map((ref) => ({
          itemType: ref.itemType,
          itemId: ref.itemId,
        })),
      },
    });

    return new Map(
      playHistory.map((history) => [
        this.getRefKey({
          itemType: history.itemType,
          itemId: history.itemId,
        }),
        history.lastPlayedAt,
      ]),
    );
  }

  private mapAlbumBasic(album: AlbumBasicPayload): AlbumBasicModel {
    return {
      id: album.id,
      name: album.name,
      date: album.date,
      artists: album.artists.map((artist) => ({
        id: artist.artist.id,
        name: artist.artist.name,
      })),
      coverColorVibrant: album.coverColorVibrant,
      coverColorDarkVibrant: album.coverColorDarkVibrant,
      coverColorLightVibrant: album.coverColorLightVibrant,
      coverColorMuted: album.coverColorMuted,
      coverColorDarkMuted: album.coverColorDarkMuted,
      coverColorLightMuted: album.coverColorLightMuted,
    };
  }

  private mapPlaylistBasic(
    playlist: PlaylistLibraryPayload,
  ): PlaylistBasicModel {
    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      visibility: playlist.visibility as PlaylistVisibility,
      creator: {
        id: playlist.user.id,
        username: playlist.user.username,
      },
      coverAlbumIds: getCoverAlbumIds(
        playlist.playlistTracks.map((track) => track.track.albumId),
      ),
    };
  }

  private compareLibraryEntries(
    left: UserLibraryEntryModel,
    right: UserLibraryEntryModel,
  ): number {
    if (left.lastPlayedAt && right.lastPlayedAt) {
      const playedAtDiff =
        right.lastPlayedAt.getTime() - left.lastPlayedAt.getTime();

      if (playedAtDiff !== 0) {
        return playedAtDiff;
      }
    }

    if (left.lastPlayedAt && !right.lastPlayedAt) {
      return -1;
    }

    if (!left.lastPlayedAt && right.lastPlayedAt) {
      return 1;
    }

    const nameDiff = left.item.name.localeCompare(right.item.name, undefined, {
      sensitivity: "base",
    });

    if (nameDiff !== 0) {
      return nameDiff;
    }

    const typeDiff = left.itemType.localeCompare(right.itemType);

    if (typeDiff !== 0) {
      return typeDiff;
    }

    return left.itemId.localeCompare(right.itemId);
  }

  private getRefKey(ref: LibraryItemRef): string {
    return `${ref.itemType}:${ref.itemId}`;
  }

  private isSameRef(left: LibraryItemRef, right: LibraryItemRef): boolean {
    return left.itemType === right.itemType && left.itemId === right.itemId;
  }

  private assertNever(): never {
    throw new BadRequestException("Unsupported library item type");
  }
}
