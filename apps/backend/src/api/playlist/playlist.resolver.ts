import { ForbiddenException, UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
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
  ): Promise<PlaylistModel> {
    return this.playlistService.getPlaylist(id);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => PlaylistModel, {
    name: "createPlaylist",
    description: "Create a new empty playlist for the current user",
  })
  async createPlaylist(
    @Args("input", { type: () => CreatePlaylistInput })
    input: CreatePlaylistInput,
    @Context("req") req: Request,
  ): Promise<PlaylistModel> {
    if (!req.user) {
      throw new ForbiddenException("Current user not found in request");
    }
    return this.playlistService.createPlaylist(req.user.id, input);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => PlaylistModel, {
    name: "updatePlaylist",
    description: "Update an existing playlist for the current user",
  })
  async updatePlaylist(
    @Args("id", { type: () => String }) id: string,
    @Args("input", { type: () => UpdatePlaylistInput })
    input: UpdatePlaylistInput,
    @Context("req") req: Request,
  ): Promise<PlaylistModel> {
    if (!req.user) {
      throw new ForbiddenException("Current user not found in request");
    }

    return this.playlistService.updatePlaylist(req.user.id, id, input);
  }
}
