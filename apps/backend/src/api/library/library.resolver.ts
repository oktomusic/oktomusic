import { ForbiddenException, UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import type { Request } from "express";

import { GraphqlAuthGuard } from "../../common/guards/graphql-auth.guard";
import { LibraryItemRefInput } from "./dto/library-item-ref.input";
import {
  LibraryItemType,
  UserLibraryEntryModel,
  UserLibraryModel,
} from "./library.model";
import { LibraryService } from "./library.service";

@Resolver()
export class LibraryResolver {
  constructor(private readonly libraryService: LibraryService) {}

  @UseGuards(GraphqlAuthGuard)
  @Query(() => UserLibraryModel, {
    name: "myLibrary",
    description: "Current user's effective library",
  })
  async myLibrary(@Context("req") req: Request): Promise<UserLibraryModel> {
    if (!req.user) {
      throw new ForbiddenException("Current user not found in request");
    }

    return this.libraryService.getMyLibrary(req.user);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => UserLibraryEntryModel, {
    name: "addLibraryItem",
    description:
      "Add an album or another user's public/unlisted playlist to the current user's library",
  })
  async addLibraryItem(
    @Args("input", { type: () => LibraryItemRefInput })
    input: LibraryItemRefInput,
    @Context("req") req: Request,
  ): Promise<UserLibraryEntryModel> {
    if (!req.user) {
      throw new ForbiddenException("Current user not found in request");
    }

    return this.libraryService.addLibraryItem(req.user, input);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Boolean, {
    name: "removeLibraryItem",
    description: "Remove an explicitly saved library item",
  })
  async removeLibraryItem(
    @Args("input", { type: () => LibraryItemRefInput })
    input: LibraryItemRefInput,
    @Context("req") req: Request,
  ): Promise<boolean> {
    if (!req.user) {
      throw new ForbiddenException("Current user not found in request");
    }

    return this.libraryService.removeLibraryItem(req.user, input);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Boolean, {
    name: "recordItemPlay",
    description: "Record that the user played an item",
  })
  async recordItemPlay(
    @Args("itemType", { type: () => LibraryItemType })
    itemType: LibraryItemType,
    @Args("itemId") itemId: string,
    @Context("req") req: Request,
  ): Promise<boolean> {
    if (!req.user) {
      throw new ForbiddenException("Current user not found in request");
    }

    return this.libraryService.recordItemPlay(req.user, { itemType, itemId });
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Boolean, {
    name: "cleanItemPlay",
    description: "Remove the records of the user playing items",
  })
  async clearItemPlay(@Context("req") req: Request): Promise<boolean> {
    if (!req.user) {
      throw new ForbiddenException("Current user not found in request");
    }

    return this.libraryService.clearItemPlay(req.user.id);
  }
}
