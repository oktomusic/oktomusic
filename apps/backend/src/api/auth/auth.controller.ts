import {
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Redirect,
  Req,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
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
  @Redirect()
  async login(@Req() req: Request) {
    const generated = await this.oidcService.generateAuthUrl();

    req.session.oidc = {
      code_verifier: generated.code_verifier,
      state: generated.state,
      nonce: generated.nonce,
    };

    return { url: generated.url, code: HttpStatus.FOUND };
  }

  @Get("callback")
  @ApiOperation({
    summary: "Handle OIDC callback",
    description:
      "Receives the authorization code from the OIDC provider and exchanges it for tokens",
  })
  async callback(@Req() req: Request) {
    const currentUrl = new URL(
      req.protocol + "://" + req.get("host") + req.originalUrl,
    );

    if (!req.session.oidc) {
      throw new InternalServerErrorException("OIDC session data not found");
    }

    const { code_verifier, state, nonce } = req.session.oidc;

    await this.oidcService.callback(currentUrl, state, code_verifier, nonce);
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
  async refresh() {}

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
