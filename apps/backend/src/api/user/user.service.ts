import { Injectable, NotFoundException } from "@nestjs/common";

import {
  PlaylistVisibility as PrismaPlaylistVisibility,
  Prisma,
  Sex,
  User,
} from "../../generated/prisma/client";
import { PrismaService } from "../../db/prisma.service";
import { PlaylistBasicModel } from "../playlist/playlist.model";
import { PlaylistVisibility } from "../playlist/playlist-visibility.enum";

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
    }));
  }
}
