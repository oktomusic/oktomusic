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
  User,
} from "../../generated/prisma/client";
import { PrismaService } from "../../db/prisma.service";
import { TrackService } from "../track/track.service";
import type { CreatePlaylistInput } from "./dto/create-playlist.input";
import type { UpdatePlaylistInput } from "./dto/update-playlist.input";
import { PlaylistModel, PlaylistTrackModel } from "./playlist.model";
import { PlaylistVisibility } from "./playlist-visibility.enum";

@Injectable()
export class PlaylistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trackService: TrackService,
  ) {}

  async getPlaylist(id: string, user: User | false): Promise<PlaylistModel> {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        playlistTracks: {
          include: {
            track: {
              include: {
                flacFile: { select: { id: true } },
                artists: {
                  include: { artist: true },
                  orderBy: { order: "asc" },
                },
                album: {
                  select: {
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
                      orderBy: { order: "asc" },
                    },
                  },
                },
              },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!playlist) {
      throw new NotFoundException(`Playlist with id ${id} not found`);
    }

    if (user === false) {
      // Internal/service-level bypass mode.
    } else if (
      playlist.userId !== user.id &&
      user.role !== Role.ADMIN &&
      playlist.visibility === PrismaPlaylistVisibility.PRIVATE
    ) {
      throw new ForbiddenException(
        "Only administrators can view private playlists from other users",
      );
    }

    const tracks: PlaylistTrackModel[] = playlist.playlistTracks.map((pt) => ({
      position: pt.position,
      addedAt: pt.addedAt,
      track: this.trackService.mapTrack(pt.track),
    }));

    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      visibility: playlist.visibility as PlaylistVisibility,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
      creator: {
        id: playlist.user.id,
        username: playlist.user.username,
      },
      tracks,
    };
  }

  async searchUserPlaylists(
    nameQuery: string,
    user: User | false,
    limit: number = 50,
  ) {
    const where: Prisma.PlaylistWhereInput = {
      name: { contains: nameQuery, mode: "insensitive" },
    };

    if (user !== false) {
      // restrict to the current user's playlists (including private)
      where.userId = user.id;
    }

    const playlists = await this.prisma.playlist.findMany({
      where,
      take: Math.max(1, Math.min(limit, 100)),
      select: {
        id: true,
        name: true,
        description: true,
        visibility: true,
        user: { select: { id: true, username: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return playlists.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      visibility: p.visibility,
      creator: { id: p.user.id, username: p.user.username },
    }));
  }

  async createPlaylist(
    input: CreatePlaylistInput,
    user: User | false,
  ): Promise<PlaylistModel> {
    const requestedOwnerId = input.userId?.trim();

    const ownerId = user === false ? requestedOwnerId : user.id;

    if (!ownerId) {
      throw new BadRequestException(
        "Playlist owner userId is required when no user context is provided",
      );
    }

    if (
      user !== false &&
      requestedOwnerId !== undefined &&
      requestedOwnerId !== user.id &&
      user.role !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        "Only administrators can create playlists for other users",
      );
    }

    const playlist = await this.prisma.playlist.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        visibility:
          (input.visibility as PrismaPlaylistVisibility | undefined) ??
          PrismaPlaylistVisibility.PRIVATE,
        userId:
          user !== false && user.role === Role.ADMIN && requestedOwnerId
            ? requestedOwnerId
            : ownerId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      visibility: playlist.visibility as PlaylistVisibility,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
      creator: {
        id: playlist.user.id,
        username: playlist.user.username,
      },
      tracks: [],
    };
  }

  async updatePlaylist(
    playlistId: string,
    user: User | false,
    input: UpdatePlaylistInput,
  ): Promise<PlaylistModel> {
    const existingPlaylist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      select: { id: true, userId: true },
    });

    if (!existingPlaylist) {
      throw new NotFoundException(`Playlist with id ${playlistId} not found`);
    }

    if (
      user !== false &&
      existingPlaylist.userId !== user.id &&
      user.role !== Role.ADMIN
    ) {
      throw new ForbiddenException("You can only update your own playlists");
    }

    const data: Prisma.PlaylistUpdateInput = {};

    if (input.name !== undefined) {
      data.name = input.name;
    }

    if (input.description !== undefined) {
      data.description = input.description;
    }

    if (input.visibility !== undefined) {
      data.visibility = input.visibility;
    }

    if (Object.keys(data).length === 0) {
      return this.getPlaylist(playlistId, user);
    }

    await this.prisma.playlist.update({
      where: { id: playlistId },
      data,
    });

    return this.getPlaylist(playlistId, user);
  }

  async deletePlaylist(playlistId: string, user: User | false): Promise<void> {
    const existingPlaylist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      select: { id: true, userId: true },
    });

    if (!existingPlaylist) {
      throw new NotFoundException(`Playlist with id ${playlistId} not found`);
    }

    if (
      user !== false &&
      existingPlaylist.userId !== user.id &&
      user.role !== Role.ADMIN
    ) {
      throw new ForbiddenException("You can only delete your own playlists");
    }

    await this.prisma.playlist.delete({ where: { id: playlistId } });
  }

  async addTracksToPlaylist(
    playlistId: string,
    user: User | false,
    trackIds: string[],
    position?: number,
  ): Promise<void> {
    const existingPlaylist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      select: { id: true, userId: true },
    });

    if (!existingPlaylist) {
      throw new NotFoundException(`Playlist with id ${playlistId} not found`);
    }

    if (
      user !== false &&
      existingPlaylist.userId !== user.id &&
      user.role !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        "You can only add tracks to your own playlists",
      );
    }

    if (trackIds.length === 0) {
      throw new BadRequestException("trackIds must contain at least one track");
    }

    const existingTracksCount = await this.prisma.track.count({
      where: { id: { in: [...new Set(trackIds)] } },
    });

    if (existingTracksCount !== [...new Set(trackIds)].length) {
      throw new NotFoundException("One or more tracks were not found");
    }

    const playlistTracksCount = await this.prisma.playlistTrack.count({
      where: { playlistId },
    });

    const insertionPosition = position ?? playlistTracksCount;

    if (insertionPosition < 0 || insertionPosition > playlistTracksCount) {
      throw new BadRequestException(
        `position must be between 0 and ${playlistTracksCount}`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const tracksToShift = await tx.playlistTrack.findMany({
        where: {
          playlistId,
          position: { gte: insertionPosition },
        },
        select: { id: true, position: true },
        orderBy: { position: "desc" },
      });

      for (const track of tracksToShift) {
        await tx.playlistTrack.update({
          where: { id: track.id },
          data: { position: track.position + trackIds.length },
        });
      }

      await tx.playlistTrack.createMany({
        data: trackIds.map((trackId, index) => ({
          playlistId,
          trackId,
          position: insertionPosition + index,
        })),
      });
    });
  }

  async reorderPlaylistTracks(
    playlistId: string,
    user: User | false,
    fromPosition: number,
    toPosition: number,
    count: number = 1,
  ): Promise<void> {
    const existingPlaylist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      select: { id: true, userId: true },
    });

    if (!existingPlaylist) {
      throw new NotFoundException(`Playlist with id ${playlistId} not found`);
    }

    if (
      user !== false &&
      existingPlaylist.userId !== user.id &&
      user.role !== Role.ADMIN
    ) {
      throw new ForbiddenException("You can only reorder your own playlists");
    }

    const playlistTracksCount = await this.prisma.playlistTrack.count({
      where: { playlistId },
    });

    if (playlistTracksCount === 0) {
      throw new BadRequestException("Playlist has no tracks to reorder");
    }

    if (count < 1) {
      throw new BadRequestException("count must be greater than or equal to 1");
    }

    if (fromPosition + count > playlistTracksCount) {
      throw new BadRequestException(
        `fromPosition + count must be less than or equal to ${playlistTracksCount}`,
      );
    }

    if (
      fromPosition < 0 ||
      fromPosition >= playlistTracksCount ||
      toPosition < 0 ||
      toPosition > playlistTracksCount - count
    ) {
      throw new BadRequestException(
        `fromPosition must be between 0 and ${playlistTracksCount - 1}, and toPosition must be between 0 and ${playlistTracksCount - count}`,
      );
    }

    if (
      fromPosition === toPosition ||
      (toPosition >= fromPosition && toPosition < fromPosition + count)
    ) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      const currentTracks = await tx.playlistTrack.findMany({
        where: { playlistId },
        select: { id: true, position: true },
        orderBy: { position: "asc" },
      });

      if (currentTracks.length !== playlistTracksCount) {
        throw new BadRequestException(
          "Playlist tracks changed while reordering, please retry",
        );
      }

      const movingBlock = currentTracks.slice(
        fromPosition,
        fromPosition + count,
      );
      const remainingTracks = [
        ...currentTracks.slice(0, fromPosition),
        ...currentTracks.slice(fromPosition + count),
      ];

      const reorderedTracks = [
        ...remainingTracks.slice(0, toPosition),
        ...movingBlock,
        ...remainingTracks.slice(toPosition),
      ];

      for (const track of currentTracks) {
        await tx.playlistTrack.update({
          where: { id: track.id },
          data: { position: track.position + playlistTracksCount },
        });
      }

      for (const [index, track] of reorderedTracks.entries()) {
        await tx.playlistTrack.update({
          where: { id: track.id },
          data: { position: index },
        });
      }
    });
  }

  async removeTracksFromPlaylist(
    playlistId: string,
    user: User | false,
    positions: number[],
  ): Promise<void> {
    const existingPlaylist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      select: { id: true, userId: true },
    });

    if (!existingPlaylist) {
      throw new NotFoundException(`Playlist with id ${playlistId} not found`);
    }

    if (
      user !== false &&
      existingPlaylist.userId !== user.id &&
      user.role !== Role.ADMIN
    ) {
      throw new ForbiddenException("You can only edit your own playlists");
    }

    if (positions.length === 0) {
      throw new BadRequestException(
        "positions must contain at least one index",
      );
    }

    const playlistTracksCount = await this.prisma.playlistTrack.count({
      where: { playlistId },
    });

    const uniquePositions = [...new Set(positions)];

    if (
      uniquePositions.some(
        (position) => position < 0 || position >= playlistTracksCount,
      )
    ) {
      throw new BadRequestException(
        `positions must be between 0 and ${Math.max(playlistTracksCount - 1, 0)}`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.playlistTrack.deleteMany({
        where: {
          playlistId,
          position: { in: uniquePositions },
        },
      });

      const remainingTracks = await tx.playlistTrack.findMany({
        where: { playlistId },
        select: { id: true },
        orderBy: { position: "asc" },
      });

      for (const [index, track] of remainingTracks.entries()) {
        await tx.playlistTrack.update({
          where: { id: track.id },
          data: { position: index },
        });
      }
    });
  }
}
