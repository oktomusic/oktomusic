import "express-session";

import * as client from "openid-client";

declare module "express-session" {
  interface SessionData {
    oidc: {
      login?: {
        code_verifier: string;
        state: string;
        nonce: string;
      };
      session?: {
        tokens: client.TokenEndpointResponse;
        profile: client.UserInfoResponse;
        userId: string;
        /**
         * Unix timestamp (seconds) when the tokens were issued or last refreshed.
         * Used with tokens.expires_in to determine token expiration.
         */
        tokenIssuedAt: number;
        /**
         * Unix timestamp (seconds) when the last refresh was attempted.
         * Used to prevent multiple rapid refresh attempts.
         */
        lastRefreshAt?: number;
      };
    };
  }
}
