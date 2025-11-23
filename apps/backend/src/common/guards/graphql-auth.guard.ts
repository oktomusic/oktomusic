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
      let expiresAt = tokenIssuedAt + tokens.expires_in;
      let secondsUntilExpiry = expiresAt - now;

      if (secondsUntilExpiry < 60) {
        // Reload session to check if another request already refreshed it
        await new Promise<void>((resolve, reject) => {
          req.session.reload((err) => {
            if (err) reject(new Error(String(err)));
            else resolve();
          });
        });

        if (!req.session.oidc?.session) {
          throw new UnauthorizedException("Not authenticated");
        }

        const sessionData = req.session.oidc.session;
        const lastRefreshAt = sessionData.lastRefreshAt ?? 0;
        const timeSinceLastRefresh = now - lastRefreshAt;

        if (sessionData.tokens.expires_in && sessionData.tokenIssuedAt) {
          expiresAt = sessionData.tokenIssuedAt + sessionData.tokens.expires_in;
          secondsUntilExpiry = expiresAt - now;
        }

        if (secondsUntilExpiry < 60 && timeSinceLastRefresh > 60) {
          this.logger.log(
            `Access token expires in ${secondsUntilExpiry} seconds, refreshing...`,
          );

          try {
            // Mark that we're refreshing now to prevent concurrent refreshes
            req.session.oidc.session.lastRefreshAt = now;

            // Save immediately to prevent other requests from refreshing
            await new Promise<void>((resolve, reject) => {
              req.session.save((err) => {
                if (err) reject(new Error(String(err)));
                else resolve();
              });
            });

            const refreshed = await this.oidcService.refresh(
              req.session.oidc.session,
            );
            req.session.oidc.session = {
              ...refreshed,
              lastRefreshAt: now,
            };

            // Explicitly save the session to persist the refreshed token
            // This is necessary because resave: false in session config
            await new Promise<void>((resolve, reject) => {
              req.session.save((err) => {
                if (err) reject(new Error(String(err)));
                else resolve();
              });
            });

            this.logger.log("Access token refreshed successfully");
          } catch (error) {
            this.logger.error("Failed to refresh access token", error);
            throw new UnauthorizedException(
              "Session expired, please log in again",
            );
          }
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
