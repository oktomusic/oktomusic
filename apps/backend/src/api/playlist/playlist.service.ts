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
                  include: {
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
      tracks,
    };
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
    });

    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      visibility: playlist.visibility as PlaylistVisibility,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
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
}
