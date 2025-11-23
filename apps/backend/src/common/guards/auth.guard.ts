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

    // Check if access token is expired or about to expire (within 60 seconds)
    // Use expires_in from token response and tokenIssuedAt timestamp
    if (tokens.expires_in && tokenIssuedAt) {
      const now = Math.floor(Date.now() / 1000);
      let expiresAt = tokenIssuedAt + tokens.expires_in;
      let secondsUntilExpiry = expiresAt - now;

      if (secondsUntilExpiry < 60) {
        // Reload session to check if another request already refreshed it
        await new Promise<void>((resolve, reject) => {
          request.session.reload((err) => {
            if (err) reject(new Error(String(err)));
            else resolve();
          });
        });

        if (!request.session.oidc?.session) {
          throw new UnauthorizedException("Not authenticated");
        }

        const sessionData = request.session.oidc.session;
        const lastRefreshAt = sessionData.lastRefreshAt ?? 0;
        const timeSinceLastRefresh = now - lastRefreshAt;

        if (sessionData.tokens.expires_in && sessionData.tokenIssuedAt) {
          expiresAt = sessionData.tokenIssuedAt + sessionData.tokens.expires_in;
          secondsUntilExpiry = expiresAt - now;
        }

        if (secondsUntilExpiry < 60 && timeSinceLastRefresh > 60) {
          // Token expires in less than 60 seconds and we haven't refreshed recently
          this.logger.log(
            `Access token expires in ${secondsUntilExpiry} seconds, refreshing...`,
          );

          try {
            // Mark that we're refreshing now to prevent concurrent refreshes
            request.session.oidc.session.lastRefreshAt = now;

            // Save immediately to prevent other requests from refreshing
            await new Promise<void>((resolve, reject) => {
              request.session.save((err) => {
                if (err) reject(new Error(String(err)));
                else resolve();
              });
            });

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
