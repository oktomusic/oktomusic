import { ForbiddenException, UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import type { Request } from "express";

import { GraphqlAuthGuard } from "../../common/guards/graphql-auth.guard";
import { Role } from "../../generated/prisma/client";
import { UpdateUserProfileInput } from "./dto/update-user-profile.input";
import { UserModel } from "./user.model";
import { UserService } from "./user.service";

@Resolver(() => UserModel)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(GraphqlAuthGuard)
  @Query(() => UserModel, { name: "me", description: "Current logged-in user" })
  me(@Context("req") req: Request): UserModel | undefined {
    return req.user;
  }

  @UseGuards(GraphqlAuthGuard)
  @Query(() => UserModel, {
    name: "userProfile",
    description: "User profile by identifier (admin access only)",
  })
  async userProfile(
    @Args("userId", { type: () => String }) userId: string,
    @Context("req") req: Request,
  ): Promise<UserModel> {
    if (req.user?.role !== Role.ADMIN) {
      throw new ForbiddenException("Admin access required");
    }

    return this.userService.getUserById(userId);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => UserModel, {
    name: "updateMyProfile",
    description: "Update the current user's profile",
  })
  async updateMyProfile(
    @Args("input") input: UpdateUserProfileInput,
    @Context("req") req: Request,
  ): Promise<UserModel> {
    if (!req.user) {
      throw new ForbiddenException("Current user not found in request");
    }

    return this.userService.updateUserProfile(req.user.id, input);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => UserModel, {
    name: "adminUpdateUserProfile",
    description: "Update a user profile as an administrator",
  })
  async adminUpdateUserProfile(
    @Args("userId", { type: () => String }) userId: string,
    @Args("input") input: UpdateUserProfileInput,
    @Context("req") req: Request,
  ): Promise<UserModel> {
    if (req.user?.role !== Role.ADMIN) {
      throw new ForbiddenException("Admin access required");
    }

    return this.userService.updateUserProfile(userId, input);
  }
}
