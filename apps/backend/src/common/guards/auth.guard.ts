import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";

import { PrismaService } from "../../db/prisma.service";
import { OidcService } from "../../oidc/oidc.service";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly oidcService: OidcService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.session.oidc?.session) {
      throw new UnauthorizedException("Not authenticated");
    }

    const { userId, tokens, tokenIssuedAt } = request.session.oidc.session;

    if (!userId) {
      throw new UnauthorizedException("User ID not found in session");
    }

    // Check if access token is expired or about to expire (within 5 minutes)
    // Use expires_in from token response and tokenIssuedAt timestamp
    if (tokens.expires_in && tokenIssuedAt) {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = tokenIssuedAt + tokens.expires_in;
      const secondsUntilExpiry = expiresAt - now;

      // Check if we recently refreshed (within last 60 seconds)
      const sessionData = request.session.oidc.session;
      const lastRefreshAt = sessionData.lastRefreshAt ?? 0;
      const timeSinceLastRefresh = now - lastRefreshAt;

      if (secondsUntilExpiry < 300 && timeSinceLastRefresh > 60) {
        // Token expires in less than 5 minutes and we haven't refreshed recently
        this.logger.log(
          `Access token expires in ${secondsUntilExpiry} seconds, refreshing...`,
        );

        try {
          // Mark that we're refreshing now to prevent concurrent refreshes
          request.session.oidc.session.lastRefreshAt = now;

          // Attempt to refresh the token
          const refreshed = await this.oidcService.refresh(
            request.session.oidc.session,
          );
          request.session.oidc.session = {
            ...refreshed,
            lastRefreshAt: now,
          };

          // Explicitly save the session to persist the refreshed token
          // This is necessary because resave: false in session config
          await new Promise<void>((resolve, reject) => {
            request.session.save((err) => {
              if (err) reject(new Error(String(err)));
              else resolve();
            });
          });

          this.logger.log("Access token refreshed successfully");
        } catch (error) {
          this.logger.error("Failed to refresh access token", error);
          // If refresh fails, the refresh token might be expired
          // Clear the session and require re-login
          throw new UnauthorizedException(
            "Session expired, please log in again",
          );
        }
      }
    }

    // Fetch user from database and attach to request
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    request.user = user;

    return true;
  }
}
