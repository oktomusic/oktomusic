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

    const { userId, tokens } = request.session.oidc.session;

    if (!userId) {
      throw new UnauthorizedException("User ID not found in session");
    }

    // Check if access token is expired or about to expire (within 5 minutes)
    // tokens.claims() is available when tokens contain an ID token
    if ("claims" in tokens && typeof tokens.claims === "function") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
      const claims = (tokens as any).claims();
      const now = Math.floor(Date.now() / 1000);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const expiresAt = claims?.exp as number | undefined;

      if (expiresAt && expiresAt - now < 300) {
        // Token expires in less than 5 minutes
        this.logger.log(
          `Access token expires in ${expiresAt - now} seconds, refreshing...`,
        );

        try {
          // Attempt to refresh the token
          const refreshed = await this.oidcService.refresh(
            request.session.oidc.session,
          );
          request.session.oidc.session = refreshed;
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
