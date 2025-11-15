import { UseGuards } from "@nestjs/common";
import { Resolver, Query, Context } from "@nestjs/graphql";
import type { Request } from "express";

import { GraphqlAuthGuard } from "../../common/guards/graphql-auth.guard";
import { UserModel } from "./user.model";

@Resolver(() => UserModel)
export class UserResolver {
  @UseGuards(GraphqlAuthGuard)
  @Query(() => UserModel, { name: "me", description: "Current logged-in user" })
  me(@Context("req") req: Request): UserModel | undefined {
    return req.user;
  }
}
