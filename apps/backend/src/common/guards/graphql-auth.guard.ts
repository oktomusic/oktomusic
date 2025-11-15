import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { Request } from "express";

import { PrismaService } from "../../db/prisma.service";
import { OidcService } from "../../oidc/oidc.service";

@Injectable()
export class GraphqlAuthGuard implements CanActivate {
  private readonly logger = new Logger(GraphqlAuthGuard.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly oidcService: OidcService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Convert to GraphQL context and extract underlying request
    const gqlCtx = GqlExecutionContext.create(context);
    const { req } = gqlCtx.getContext<{ req: Request & { user?: unknown } }>();

    if (!req.session.oidc?.session) {
      throw new UnauthorizedException("Not authenticated");
    }

    const { userId, tokens, tokenIssuedAt } = req.session.oidc.session;

    if (!userId) {
      throw new UnauthorizedException("User ID not found in session");
    }

    if (tokens.expires_in && tokenIssuedAt) {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = tokenIssuedAt + tokens.expires_in;
      const secondsUntilExpiry = expiresAt - now;

      if (secondsUntilExpiry < 300) {
        this.logger.log(
          `Access token expires in ${secondsUntilExpiry} seconds, refreshing...`,
        );

        try {
          const refreshed = await this.oidcService.refresh(
            req.session.oidc.session,
          );
          req.session.oidc.session = refreshed;
          this.logger.log("Access token refreshed successfully");
        } catch (error) {
          this.logger.error("Failed to refresh access token", error);
          throw new UnauthorizedException(
            "Session expired, please log in again",
          );
        }
      }
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Attach user to request for downstream resolvers
    req.user = user;

    return true;
  }
}
