import { Injectable, NotFoundException } from "@nestjs/common";

import {
  PlaylistVisibility as PrismaPlaylistVisibility,
  Prisma,
  Sex,
  User,
} from "../../generated/prisma/client";
import { PrismaService } from "../../db/prisma.service";
import { PlaylistBasicModel } from "../playlist/playlist.model";
import { getCoverAlbumIds } from "../playlist/playlist-cover.utils";
import { PlaylistVisibility } from "../playlist/playlist-visibility.enum";
import { type LibraryItemType } from "./user.model";

interface UpdateUserProfileData {
  sex?: Sex | null;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async updateUserProfile(id: string, data: UpdateUserProfileData) {
    const updateData: Prisma.UserUpdateInput = {};

    if (data.sex !== undefined) {
      updateData.sex = data.sex ?? null;
    }

    if (Object.keys(updateData).length === 0) {
      return this.getUserById(id);
    }

    try {
      return await this.prisma.user.update({ where: { id }, data: updateData });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException("User not found");
      }

      throw error;
    }
  }

  async getUserPlaylistsForViewer(
    targetUserId: string,
    viewer: User,
  ): Promise<PlaylistBasicModel[]> {
    const isOwnProfile = viewer.id === targetUserId;

    const playlists = await this.prisma.playlist.findMany({
      where: {
        userId: targetUserId,
        ...(isOwnProfile
          ? {}
          : { visibility: PrismaPlaylistVisibility.PUBLIC }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        visibility: true,
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
          orderBy: { position: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return playlists.map((playlist) => ({
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
    }));
  }

  async recordItemPlay(
    userId: string,
    itemType: LibraryItemType,
    itemId: string,
  ): Promise<boolean> {
    const lastPlayedAt = new Date();

    try {
      switch (itemType) {
        case "ALBUM":
          await this.prisma.userPlayHistoryAlbum.upsert({
            where: {
              userId_albumId: {
                userId,
                albumId: itemId,
              },
            },
            create: {
              userId,
              albumId: itemId,
              lastPlayedAt,
            },
            update: {
              lastPlayedAt,
            },
          });
          return true;
        case "PLAYLIST":
          await this.prisma.userPlayHistoryPlaylist.upsert({
            where: {
              userId_playlistId: {
                userId,
                playlistId: itemId,
              },
            },
            create: {
              userId,
              playlistId: itemId,
              lastPlayedAt,
            },
            update: {
              lastPlayedAt,
            },
          });
          return true;
        default:
          throw new Error("Invalid item type");
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2003" || error.code === "P2025")
      ) {
        throw new NotFoundException("Library item not found");
      }

      throw error;
    }
  }

  async clearItemPlay(userId: string): Promise<boolean> {
    await this.prisma.userPlayHistoryAlbum.deleteMany({
      where: { userId },
    });

    await this.prisma.userPlayHistoryPlaylist.deleteMany({
      where: { userId },
    });

    return true;
  }
}
