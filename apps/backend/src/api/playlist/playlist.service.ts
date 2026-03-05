import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../../db/prisma.service";
import { TrackService } from "../track/track.service";
import type { CreatePlaylistInput } from "./dto/create-playlist.input";
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
      isPublic: playlist.isPublic,
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
        isPublic: input.isPublic ?? false,
        userId,
      },
    });

    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      isPublic: playlist.isPublic,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
      tracks: [],
    };
  }
}
