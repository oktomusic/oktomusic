import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { Prisma } from "../../generated/prisma/client";
import { PrismaService } from "../../db/prisma.service";
import { TrackService } from "../track/track.service";
import type { CreatePlaylistInput } from "./dto/create-playlist.input";
import type { UpdatePlaylistInput } from "./dto/update-playlist.input";
import { PlaylistVisibility } from "./playlist-visibility.enum";
import { PlaylistModel, PlaylistTrackModel } from "./playlist.model";

@Injectable()
export class PlaylistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trackService: TrackService,
  ) {}

  async getPlaylist(id: string): Promise<PlaylistModel> {
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
    userId: string,
    input: CreatePlaylistInput,
  ): Promise<PlaylistModel> {
    const playlist = await this.prisma.playlist.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        visibility: input.visibility ?? PlaylistVisibility.PRIVATE,
        userId,
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
    userId: string,
    playlistId: string,
    input: UpdatePlaylistInput,
  ): Promise<PlaylistModel> {
    const existingPlaylist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      select: { id: true, userId: true },
    });

    if (!existingPlaylist) {
      throw new NotFoundException(`Playlist with id ${playlistId} not found`);
    }

    if (existingPlaylist.userId !== userId) {
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
      return this.getPlaylist(playlistId);
    }

    await this.prisma.playlist.update({
      where: { id: playlistId },
      data,
    });

    return this.getPlaylist(playlistId);
  }
}
