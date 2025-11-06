import "express-session";

declare module "express-session" {
  interface SessionData {
    oidc: {
      code_verifier: string;
      state: string;
      nonce: string;
    };
  }
}
