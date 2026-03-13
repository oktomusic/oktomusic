import { ForbiddenException, UseGuards } from "@nestjs/common";
import { Args, Context, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import type { Request } from "express";

import { GraphqlAuthGuard } from "../../common/guards/graphql-auth.guard";
import { CreatePlaylistInput } from "./dto/create-playlist.input";
import { UpdatePlaylistInput } from "./dto/update-playlist.input";
import { PlaylistModel } from "./playlist.model";
import { PlaylistService } from "./playlist.service";

@Resolver()
export class PlaylistResolver {
  constructor(private readonly playlistService: PlaylistService) {}

  @UseGuards(GraphqlAuthGuard)
  @Query(() => PlaylistModel, {
    name: "playlist",
    description: "Get a playlist by ID with its tracks in order",
  })
  async playlist(
    @Args("id", { type: () => String }) id: string,
    @Context("req") req: Request,
  ): Promise<PlaylistModel> {
    if (!req.user) {
      throw new ForbiddenException("Current user not found in request");
    }

    return this.playlistService.getPlaylist(id, req.user);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => PlaylistModel, {
    name: "createPlaylist",
    description:
      "Create a new empty playlist for the current user, or as administrator for a specific user",
  })
  async createPlaylist(
    @Args("input", {
      type: () => CreatePlaylistInput,
      description: "Playlist creation data",
    })
    input: CreatePlaylistInput,
    @Context("req") req: Request,
  ): Promise<PlaylistModel> {
    if (!req.user) {
      throw new ForbiddenException("Current user not found in request");
    }

    return this.playlistService.createPlaylist(input, req.user);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => PlaylistModel, {
    name: "updatePlaylist",
    description:
      "Update an existing playlist for the current user, or any playlist as administrator",
  })
  async updatePlaylist(
    @Args("id", {
      type: () => String,
      description: "ID of the playlist to update",
    })
    id: string,
    @Args("input", {
      type: () => UpdatePlaylistInput,
      description: "Updated playlist details",
    })
    input: UpdatePlaylistInput,
    @Context("req") req: Request,
  ): Promise<PlaylistModel> {
    if (!req.user) {
      throw new ForbiddenException("Current user not found in request");
    }

    return this.playlistService.updatePlaylist(id, req.user, input);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Boolean, {
    name: "deletePlaylist",
    description:
      "Delete an existing playlist for the current user, or as administrator",
  })
  async deletePlaylist(
    @Args("id", {
      type: () => String,
      description: "ID of the playlist to delete",
    })
    id: string,
    @Context("req") req: Request,
  ): Promise<boolean> {
    if (!req.user) {
      throw new ForbiddenException("Current user not found in request");
    }

    await this.playlistService.deletePlaylist(id, req.user);

    return true;
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Boolean, {
    name: "addTracksToPlaylist",
    description: "Add one or more tracks to a playlist at a specific position",
  })
  async addTracksToPlaylist(
    @Args("id", {
      type: () => String,
      description: "ID of the playlist to add tracks to",
    })
    playlistId: string,
    @Args("position", {
      type: () => Int,
      nullable: true,
      description: "Position in the playlist (0-based)",
    })
    position: number | null,
    @Args("trackIds", {
      type: () => [String],
      description: "List of track IDs to add to the playlist",
    })
    trackIds: string[],
    @Context("req") req: Request,
  ): Promise<boolean> {
    if (!req.user) {
      throw new ForbiddenException("Current user not found in request");
    }

    await this.playlistService.addTracksToPlaylist(
      playlistId,
      req.user,
      trackIds,
      position ?? undefined,
    );

    return true;
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Boolean, {
    name: "reorderPlaylistTracks",
    description: "Move a track from one position to another in a playlist",
  })
  async reorderPlaylistTracks(
    @Args("id", {
      type: () => String,
      description: "ID of the playlist",
    })
    playlistId: string,
    @Args("fromPosition", {
      type: () => Int,
      description: "Current position of the track (0-based)",
    })
    fromPosition: number,
    @Args("toPosition", {
      type: () => Int,
      description: "Destination position of the track (0-based)",
    })
    toPosition: number,
    @Args("count", {
      type: () => Int,
      nullable: true,
      description: "Number of consecutive tracks to move (defaults to 1)",
    })
    count: number | null,
    @Context("req") req: Request,
  ): Promise<boolean> {
    if (!req.user) {
      throw new ForbiddenException("Current user not found in request");
    }

    await this.playlistService.reorderPlaylistTracks(
      playlistId,
      req.user,
      fromPosition,
      toPosition,
      count ?? undefined,
    );

    return true;
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Boolean, {
    name: "removeTracksFromPlaylist",
    description: "Remove one or more tracks from a playlist",
  })
  async removeTracksFromPlaylist(
    @Args("id", {
      type: () => String,
      description: "ID of the playlist",
    })
    playlistId: string,
    @Args("positions", {
      type: () => [Int],
      description: "List of playlist positions to remove",
    })
    positions: number[],
    @Context("req") req: Request,
  ): Promise<boolean> {
    if (!req.user) {
      throw new ForbiddenException("Current user not found in request");
    }

    await this.playlistService.removeTracksFromPlaylist(
      playlistId,
      req.user,
      positions,
    );

    return true;
  }
}
