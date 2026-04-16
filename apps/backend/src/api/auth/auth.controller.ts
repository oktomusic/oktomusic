import {
  Controller,
  Get,
  HttpRedirectResponse,
  HttpStatus,
  InternalServerErrorException,
  Redirect,
  Req,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

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
      userId: result.userId,
      tokenIssuedAt: result.tokenIssuedAt,
    };

    return { url: "/", statusCode: HttpStatus.FOUND };
  }

  @Get("logout")
  @ApiOperation({
    summary: "Logout user",
    description: "Clears the session and redirects to the login page",
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: "Redirects to application to login page after logout",
  })
  @Redirect()
  async logout(@Req() req: Request) {
    // const idToken = req.session.oidc?.session?.tokens.id_token;

    // Build end session URL before destroying session
    // const logoutUrl = this.oidcService.buildEndSessionUrl(idToken);

    // Destroy the session
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(new Error(err instanceof Error ? err.message : String(err)));
        } else {
          resolve();
        }
      });
    });

    return { url: "/login", statusCode: HttpStatus.FOUND };
  }
}
