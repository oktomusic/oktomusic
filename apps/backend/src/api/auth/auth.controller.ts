import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import type { Request, Response } from "express";
import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

import {
  AuthCallbackQuery,
  AuthCallbackRes,
  AuthCallbackResJSONSchema,
  AuthLoginRes,
  AuthLoginResJSONSchema,
  AuthLogoutRes,
  AuthLogoutResJSONSchema,
  AuthRefreshRes,
  AuthRefreshResJSONSchema,
  AuthSessionRes,
  AuthSessionResJSONSchema,
} from "@oktomusic/api-schemas";

import { OidcService } from "../../oidc/oidc.service";
import { SessionService } from "./session.service";
import { ZodValidationPipe } from "../zod.pipe";
import { AuthCallbackQuerySchema } from "@oktomusic/api-schemas";

const SESSION_COOKIE_NAME = "oktomusic_session";
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: "/",
};

@Controller("api/auth")
@ApiTags("Auth")
export class AuthController {
  constructor(
    private readonly oidcService: OidcService,
    private readonly sessionService: SessionService,
  ) {}

  @Get("login")
  @ApiOperation({
    summary: "Initiate OIDC login flow",
    description:
      "Generates an authorization URL and stores necessary state for the OIDC callback",
  })
  @ApiOkResponse({
    schema: AuthLoginResJSONSchema as SchemaObject,
    description: "Authorization URL to redirect the user to",
  })
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthLoginRes> {
    // Generate session ID if not exists
    let sessionId = req.cookies[SESSION_COOKIE_NAME] as string | undefined;
    if (!sessionId) {
      sessionId = this.generateSessionId();
      res.cookie(SESSION_COOKIE_NAME, sessionId, SESSION_COOKIE_OPTIONS);
    }

    // Generate auth URL with PKCE
    const { url, state, codeVerifier } =
      await this.oidcService.generateAuthUrl();

    // Store code verifier and state temporarily
    this.sessionService.storeTempAuthState(sessionId, codeVerifier, state);

    return { authUrl: url };
  }

  @Get("callback")
  @ApiOperation({
    summary: "Handle OIDC callback",
    description:
      "Receives the authorization code from the OIDC provider and exchanges it for tokens",
  })
  @ApiQuery({
    name: "code",
    required: true,
    description: "Authorization code from OIDC provider",
    type: String,
  })
  @ApiQuery({
    name: "state",
    required: false,
    description: "State parameter for CSRF protection",
    type: String,
  })
  @ApiOkResponse({
    schema: AuthCallbackResJSONSchema as SchemaObject,
    description: "Callback processing result",
  })
  async callback(
    @Query(new ZodValidationPipe(AuthCallbackQuerySchema))
    query: AuthCallbackQuery,
    @Req() req: Request,
  ): Promise<AuthCallbackRes> {
    const sessionId = req.cookies[SESSION_COOKIE_NAME] as string | undefined;
    if (!sessionId) {
      throw new HttpException(
        "No session cookie found",
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Retrieve stored code verifier and state
    const tempAuthState =
      this.sessionService.retrieveTempAuthState(sessionId);
    if (!tempAuthState) {
      throw new HttpException(
        "Invalid or expired session state",
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Verify state if present
    if (tempAuthState.state && query.state !== tempAuthState.state) {
      throw new HttpException("State mismatch", HttpStatus.UNAUTHORIZED);
    }

    try {
      // Exchange authorization code for tokens
      const tokens = await this.oidcService.handleCallback(
        () =>
          new URL(
            `${req.protocol}://${req.get("host")}${req.originalUrl}`,
          ),
        tempAuthState.codeVerifier,
        tempAuthState.state,
      );

      // Get user info
      const userInfo = await this.oidcService.getUserInfo(
        tokens.access_token,
      );

      // Calculate token expiration (use expires_in if provided, otherwise default to 1 hour)
      const expiresIn = tokens.expires_in || 3600;
      const expiresAt = Date.now() + expiresIn * 1000;

      // Store session
      this.sessionService.storeSession(sessionId, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        idToken: tokens.id_token,
        expiresAt,
        userInfo,
      });

      return { success: true };
    } catch (error) {
      throw new HttpException(
        `OIDC callback failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get("session")
  @ApiOperation({
    summary: "Get current session status",
    description:
      "Returns whether the user is authenticated and their user information if available",
  })
  @ApiOkResponse({
    schema: AuthSessionResJSONSchema as SchemaObject,
    description: "Current session status",
  })
  session(@Req() req: Request): AuthSessionRes {
    const sessionId = req.cookies[SESSION_COOKIE_NAME] as string | undefined;
    if (!sessionId) {
      return { authenticated: false };
    }

    const session = this.sessionService.getSession(sessionId);
    if (!session) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      userInfo: session.userInfo,
    };
  }

  @Get("refresh")
  @ApiOperation({
    summary: "Refresh access token",
    description:
      "Uses the refresh token to obtain a new access token without requiring re-authentication",
  })
  @ApiOkResponse({
    schema: AuthRefreshResJSONSchema as SchemaObject,
    description: "Token refresh result",
  })
  async refresh(@Req() req: Request): Promise<AuthRefreshRes> {
    const sessionId = req.cookies[SESSION_COOKIE_NAME] as string | undefined;
    if (!sessionId) {
      throw new HttpException("No session found", HttpStatus.UNAUTHORIZED);
    }

    const session = this.sessionService.getSession(sessionId);
    if (!session || !session.refreshToken) {
      throw new HttpException(
        "No refresh token available",
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      // Refresh tokens
      const tokens = await this.oidcService.refreshTokens(
        session.refreshToken,
      );

      // Calculate new expiration
      const expiresIn = tokens.expires_in || 3600;
      const expiresAt = Date.now() + expiresIn * 1000;

      // Update session with new tokens
      this.sessionService.updateSession(sessionId, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || session.refreshToken,
        idToken: tokens.id_token || session.idToken,
        expiresAt,
      });

      // Refresh user info with new access token
      const userInfo = await this.oidcService.getUserInfo(
        tokens.access_token,
      );
      this.sessionService.updateSession(sessionId, { userInfo });

      return { success: true };
    } catch (error) {
      throw new HttpException(
        `Token refresh failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get("logout")
  @ApiOperation({
    summary: "Logout user",
    description:
      "Clears the session and optionally provides the OIDC end session URL for complete logout",
  })
  @ApiOkResponse({
    schema: AuthLogoutResJSONSchema as SchemaObject,
    description: "Logout result with optional end session URL",
  })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthLogoutRes> {
    const sessionId = req.cookies[SESSION_COOKIE_NAME] as string | undefined;

    let logoutUrl: string | undefined;

    if (sessionId) {
      const session = this.sessionService.getSession(sessionId);

      // Build logout URL if we have an ID token
      if (session?.idToken) {
        logoutUrl = await Promise.resolve(
          this.oidcService.buildLogoutUrl(session.idToken),
        );
      }

      // Delete session
      this.sessionService.deleteSession(sessionId);
    }

    // Clear session cookie
    res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });

    return {
      success: true,
      logoutUrl,
    };
  }

  private generateSessionId(): string {
    // Generate a cryptographically secure random session ID
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }
}

