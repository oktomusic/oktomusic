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
      };
    };
  }
}
