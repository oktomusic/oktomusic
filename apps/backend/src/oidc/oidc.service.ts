import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";

import * as client from "openid-client";

import oidcConfig from "../config/definitions/oidc.config";

@Injectable()
export class OidcService implements OnModuleInit {
  private readonly logger = new Logger(OidcService.name);
  private config: client.Configuration;

  constructor(
    @Inject(oidcConfig.KEY)
    private readonly oidcConf: ConfigType<typeof oidcConfig>,
  ) {}

  async onModuleInit() {
    this.logger.log(
      `Discovering OIDC configuration from ${this.oidcConf.issuer}`,
    );

    // Use the Issuer Identifier URL directly; discovery will resolve the well-known endpoint
    this.config = await client.discovery(
      new URL(this.oidcConf.issuer + "/.well-known/openid-configuration"),
      this.oidcConf.clientId,
      this.oidcConf.clientSecret,
    );

    this.logger.log("OIDC configuration successfully loaded");
  }

  async generateAuthUrl(): Promise<{
    url: string;
    state?: string;
    codeVerifier: string;
  }> {
    const redirectUri = this.oidcConf.redirectUri;
    const scope = this.oidcConf.scopes;

    // PKCE - generate verifier & challenge
    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);

    const parameters: Record<string, string> = {
      redirect_uri: redirectUri,
      scope,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    };

    // If PKCE support cannot be determined, include state for CSRF protection
    if (!this.config.serverMetadata().supportsPKCE()) {
      parameters.state = client.randomState();
    }

    const redirectTo = client.buildAuthorizationUrl(this.config, parameters);

    return {
      url: redirectTo.href,
      state: parameters.state,
      codeVerifier,
    };
  }

  async buildAuthUrl(state: string, codeVerifier: string): Promise<string> {
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);

    const url = client.buildAuthorizationUrl(this.config, {
      redirect_uri: this.oidcConf.redirectUri,
      scope: this.oidcConf.scopes,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
    });

    return url.href;
  }

  async handleCallback(
    getCurrentUrl: () => URL,
    codeVerifier: string,
    expectedState?: string,
  ): Promise<client.TokenEndpointResponse> {
    const tokens = await client.authorizationCodeGrant(
      this.config,
      getCurrentUrl(),
      {
        pkceCodeVerifier: codeVerifier,
        expectedState,
      },
    );

    this.logger.debug("Authorization Code Grant completed");
    return tokens;
  }

  async getUserInfo(accessToken: string): Promise<Record<string, unknown>> {
    // fetchUserInfo returns the parsed userinfo JSON, not a Response
    const userinfo = await client.fetchUserInfo(
      this.config,
      accessToken,
      "GET",
    );
    return userinfo as Record<string, unknown>;
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<client.TokenEndpointResponse> {
    const tokens = await client.refreshTokenGrant(this.config, refreshToken);
    this.logger.debug("Tokens refreshed");
    return tokens;
  }

  buildLogoutUrl(idTokenHint: string): string {
    const params: Record<string, string> = { id_token_hint: idTokenHint };
    if (this.oidcConf.logoutRedirectUri) {
      params.post_logout_redirect_uri = this.oidcConf.logoutRedirectUri;
    }
    return client.buildEndSessionUrl(this.config, params).href;
  }
}
