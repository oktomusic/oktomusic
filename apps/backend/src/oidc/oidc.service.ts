import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";

import * as client from "openid-client";

import oidcConfig from "../config/definitions/oidc.config";
import { PrismaService } from "../db/prisma.service";
import { Role } from "../generated/prisma";

interface OidcGeneratedUrl {
  url: URL;
  code_verifier: string;
  state: string;
  nonce: string;
}

interface OidcCallbackResult {
  tokens: client.TokenEndpointResponse;
  profile: client.UserInfoResponse;
  userId: string;
}

@Injectable()
export class OidcService implements OnModuleInit {
  private readonly logger = new Logger(OidcService.name);
  private config: client.Configuration;

  constructor(
    @Inject(oidcConfig.KEY)
    private readonly oidcConf: ConfigType<typeof oidcConfig>,
    private readonly prisma: PrismaService,
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
   * Extract role from Keycloak resource_access claim
   * Assumes client_id matches the resource key in resource_access
   */
  private extractRoleFromIntrospection(
    introspection: client.IntrospectionResponse,
  ): Role {
    const resourceAccess = introspection.resource_access as Record<
      string,
      { roles?: string[] }
    >;

    if (!resourceAccess) {
      return Role.USER;
    }

    const clientRoles = resourceAccess[this.oidcConf.clientId]?.roles || [];

    // Admin role inherits from user, so check admin first
    if (clientRoles.includes("admin")) {
      return Role.ADMIN;
    }

    if (clientRoles.includes("user")) {
      return Role.USER;
    }

    return Role.USER;
  }

  /**
   * Sync or create user in database based on OIDC profile
   */
  private async syncUser(
    sub: string,
    username: string,
    role: Role,
  ): Promise<string> {
    const user = await this.prisma.user.upsert({
      where: { oidcSub: sub },
      update: {
        username,
        role,
      },
      create: {
        oidcSub: sub,
        username,
        role,
      },
    });

    return user.id;
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

    // Extract role from Keycloak resource_access
    const role = this.extractRoleFromIntrospection(introspection);

    // Get username from profile (preferred_username is Keycloak-specific)
    const username =
      (profile.preferred_username as string) || profile.sub || claims.sub;

    // Sync user to database
    const userId = await this.syncUser(claims.sub, username, role);

    return {
      tokens,
      profile,
      userId,
    };
  }

  async refresh(oidcSession: OidcCallbackResult): Promise<OidcCallbackResult> {
    if (!oidcSession.tokens.refresh_token) {
      throw new Error("No refresh token available in the session");
    }

    const newTokens = await client.refreshTokenGrant(
      this.config,
      oidcSession.tokens.refresh_token,
    );

    const claims = newTokens.claims();

    if (!claims?.sub) {
      throw new Error("ID token does not contain 'sub' claim");
    }

    const newProfile = await client.fetchUserInfo(
      this.config,
      newTokens.access_token,
      claims.sub,
    );

    // Introspect the new access token to get updated roles
    const introspection = await client.tokenIntrospection(
      this.config,
      newTokens.access_token,
    );

    const role = this.extractRoleFromIntrospection(introspection);

    const username =
      (newProfile.preferred_username as string) ||
      newProfile.sub ||
      claims.sub;

    // Update user in database with potentially new role/username
    const userId = await this.syncUser(claims.sub, username, role);

    return {
      tokens: newTokens,
      profile: newProfile,
      userId,
    };
  }

  /**
   * Build the OIDC end session URL for logout
   */
  buildEndSessionUrl(idToken?: string): string | undefined {
    const metadata = this.config.serverMetadata();

    if (!metadata.end_session_endpoint) {
      return undefined;
    }

    const params: Record<string, string> = {};

    if (idToken) {
      params.id_token_hint = idToken;
    }

    if (this.oidcConf.logoutRedirectUri) {
      params.post_logout_redirect_uri = this.oidcConf.logoutRedirectUri;
    }

    return client.buildEndSessionUrl(this.config, params).toString();
  }
}
