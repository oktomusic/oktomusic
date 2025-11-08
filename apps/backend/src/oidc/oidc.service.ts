import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";

import * as client from "openid-client";

import oidcConfig from "../config/definitions/oidc.config";

interface OidcGeneratedUrl {
  url: URL;
  code_verifier: string;
  state: string;
  nonce: string;
}

interface OidcCallbackResult {
  tokens: client.TokenEndpointResponse;
  profile: client.UserInfoResponse;
}

@Injectable()
export class OidcService implements OnModuleInit {
  private readonly logger = new Logger(OidcService.name);
  private config: client.Configuration;

  constructor(
    @Inject(oidcConfig.KEY)
    private readonly oidcConf: ConfigType<typeof oidcConfig>,
  ) {}

  /**
   * Initialize OpenID client by discovering OpenID Provider's configuration
   *
   * OpenID Connect Discovery: https://openid.net/specs/openid-connect-discovery-1_0.html
   */
  async onModuleInit() {
    this.logger.log(
      `Discovering OIDC configuration from ${this.oidcConf.issuer}`,
    );

    this.config = await client.discovery(
      new URL(this.oidcConf.issuer + "/.well-known/openid-configuration"),
      this.oidcConf.clientId,
      this.oidcConf.clientSecret,
    );

    const serverMetadatadata = this.config.serverMetadata();

    if (serverMetadatadata.userinfo_endpoint === undefined) {
      throw new Error("OIDC provider does not support userinfo endpoint");
    }

    this.logger.log("OIDC configuration successfully loaded");
  }

  /**
   * Generate OIDC authorization URL with PKCE parameters
   */
  async generateAuthUrl(): Promise<OidcGeneratedUrl> {
    const redirect_uri = this.oidcConf.redirectUri;
    const scope = this.oidcConf.scopes;

    // 1. Generate PKCE code verifier and challenge
    const code_verifier = client.randomPKCECodeVerifier();
    const code_challenge =
      await client.calculatePKCECodeChallenge(code_verifier);
    const state = client.randomState();
    const nonce = client.randomNonce();

    // 2. Build authorization URL
    return {
      url: client.buildAuthorizationUrl(this.config, {
        redirect_uri,
        scope,
        code_challenge,
        code_challenge_method: "S256",
        state,
        nonce,
      }),
      code_verifier: code_verifier,
      state,
      nonce,
    };
  }

  async callback(
    currentUrl: URL,
    state: string,
    code_verifier: string,
    nonce: string,
  ): Promise<OidcCallbackResult> {
    const tokens = await client.authorizationCodeGrant(
      this.config,
      currentUrl,
      {
        pkceCodeVerifier: code_verifier, // from stored session
        expectedState: state,
        expectedNonce: nonce,
      },
    );

    const claims = tokens.claims();

    console.log("Availlable claims:", claims);

    const introspection = await client.tokenIntrospection(
      this.config,
      tokens.access_token,
    );

    console.log("Access Token Introspection:", introspection.resource_access);

    if (!claims?.sub) {
      throw new Error("ID token does not contain 'sub' claim");
    }

    const profile = await client.fetchUserInfo(
      this.config,
      tokens.access_token,
      claims.sub,
    );

    console.log("User profile:", profile);

    return {
      tokens,
      profile,
    };
  }
}
