import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { Request } from "express";

import { Role } from "../../generated/prisma";

import { GraphqlAuthGuard } from "./graphql-auth.guard";

@Injectable()
export class GraphqlAdminGuard implements CanActivate {
  constructor(private readonly graphqlAuthGuard: GraphqlAuthGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, ensure user is authenticated
    await this.graphqlAuthGuard.canActivate(context);

    // Convert to GraphQL context and extract underlying request
    const gqlCtx = GqlExecutionContext.create(context);
    const { req } = gqlCtx.getContext<{ req: Request }>();

    if (req.user?.role !== Role.ADMIN) {
      throw new ForbiddenException("Admin access required");
    }

    return true;
  }
}
