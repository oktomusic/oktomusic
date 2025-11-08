import {
  Controller,
  Get,
  HttpRedirectResponse,
  HttpStatus,
  InternalServerErrorException,
  Redirect,
  Req,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import type { Request } from "express";

import { AuthLogoutResJSONSchema } from "@oktomusic/api-schemas";

import { OidcService } from "../../oidc/oidc.service";

@Controller("api/auth")
@ApiTags("Auth")
export class AuthController {
  constructor(private readonly oidcService: OidcService) {}

  @Get("login")
  @ApiOperation({
    summary: "Initiate OIDC login flow",
    description:
      "Generates an authorization URL and stores necessary state for the OIDC callback",
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: "Redirects to the OIDC provider's authorization endpoint",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Missing or invalid session state for OIDC flow",
  })
  @Redirect()
  async login(@Req() req: Request): Promise<HttpRedirectResponse> {
    const generated = await this.oidcService.generateAuthUrl();

    if (!req.session.oidc) req.session.oidc = {};
    req.session.oidc.login = {
      code_verifier: generated.code_verifier,
      state: generated.state,
      nonce: generated.nonce,
    };

    return { url: generated.url.toString(), statusCode: HttpStatus.FOUND };
  }

  @Get("callback")
  @ApiOperation({
    summary: "Handle OIDC callback",
    description:
      "Receives the authorization code from the OIDC provider and exchanges it for tokens.",
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description:
      "Redirects to application root after successful authentication",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Missing or invalid session state for OIDC flow",
  })
  @Redirect()
  async callback(@Req() req: Request): Promise<HttpRedirectResponse> {
    const currentUrl = new URL(
      req.protocol + "://" + req.get("host") + req.originalUrl,
    );

    if (!req.session.oidc?.login) {
      throw new InternalServerErrorException("OIDC session data not found");
    }

    const { code_verifier, state, nonce } = req.session.oidc.login;

    const result = await this.oidcService.callback(
      currentUrl,
      state,
      code_verifier,
      nonce,
    );

    req.session.oidc.session = {
      tokens: result.tokens,
      profile: result.profile,
    };

    return { url: "/", statusCode: HttpStatus.FOUND };
  }

  @Get("session")
  @ApiOperation({
    summary: "Get current session status",
    description:
      "Returns whether the user is authenticated and their user information if available",
  })
  session() {}

  @Get("refresh")
  @ApiOperation({
    summary: "Refresh access token",
    description:
      "Uses the refresh token to obtain a new access token without requiring re-authentication",
  })
  async refresh(@Req() req: Request) {
    if (!req.session.oidc?.session) {
      throw new InternalServerErrorException("OIDC session data not found");
    }

    req.session.oidc.session = await this.oidcService.refresh(
      req.session.oidc.session,
    );

    return {};
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
  async logout() {}
}
