import { registerAs } from "@nestjs/config";
import { z } from "zod";

/**
 * Configuration for the OpenID Connect (OIDC) authentication provider.
 */
const OidcConfigSchema = z.object({
  /**
   * Base URL of the OIDC issuer (e.g. https://auth.example.com/realms/main)
   * Must point to the provider’s discovery endpoint base.
   */
  OIDC_ISSUER: z.url("OIDC_ISSUER must be a valid URL"),

  /**
   * Client ID registered with the OIDC provider.
   * Identifies your NestJS backend as a relying party (RP).
   */
  OIDC_CLIENT_ID: z.string().min(1, "OIDC_CLIENT_ID is required"),

  /**
   * Client Secret registered with the OIDC provider.
   * Used for secure token exchange during the authorization code flow.
   */
  OIDC_CLIENT_SECRET: z.string().min(1, "OIDC_CLIENT_SECRET is required"),

  /**
   * Redirect URI that the OIDC provider will redirect back to
   * after successful authentication. Must match the provider config.
   */
  OIDC_REDIRECT_URI: z.url("OIDC_REDIRECT_URI must be a valid URL"),

  /**
   * Optional post-logout redirect URI, used for frontchannel logout.
   * When set, users are redirected here after logging out from the provider.
   */
  OIDC_LOGOUT_REDIRECT_URI: z.url().optional(),

  /**
   * Scopes to request during authentication.
   * Default: "openid profile"
   */
  OIDC_SCOPES: z.string().default("openid profile"),

  /**
   * OIDC response type used during authorization.
   * Typically "code" for authorization code flow.
   */
  OIDC_RESPONSE_TYPE: z.string().default("code"),

  /**
   * Whether to automatically fetch the provider’s discovery document.
   * If false, endpoints must be manually configured.
   */
  OIDC_AUTO_DISCOVERY: z.coerce.boolean().default(true),

  /**
   * Optional cache TTL for JWKS (JSON Web Key Set) validation, in seconds.
   * Helps avoid excessive requests to the OIDC provider.
   */
  OIDC_JWKS_CACHE_TTL: z.coerce.number().default(3600),
});

export interface OidcConfig {
  /** Base URL of the OIDC issuer */
  issuer: string;
  /** Client ID registered with the OIDC provider */
  clientId: string;
  /** Client secret for token exchange */
  clientSecret: string;
  /** Redirect URI after login */
  redirectUri: string;
  /** Post-logout redirect URI (optional) */
  logoutRedirectUri?: string;
  /** Scopes requested during authorization */
  scopes: string;
  /** OAuth2 response type, e.g. "code" */
  responseType: string;
  /** Whether to use OIDC auto-discovery */
  autoDiscovery: boolean;
  /** JWKS cache time-to-live, in seconds */
  jwksCacheTtl: number;
}

export default registerAs("oidc", (): OidcConfig => {
  const parsed = OidcConfigSchema.parse(process.env);
  return {
    issuer: parsed.OIDC_ISSUER,
    clientId: parsed.OIDC_CLIENT_ID,
    clientSecret: parsed.OIDC_CLIENT_SECRET,
    redirectUri: parsed.OIDC_REDIRECT_URI,
    logoutRedirectUri: parsed.OIDC_LOGOUT_REDIRECT_URI,
    scopes: parsed.OIDC_SCOPES,
    responseType: parsed.OIDC_RESPONSE_TYPE,
    autoDiscovery: parsed.OIDC_AUTO_DISCOVERY,
    jwksCacheTtl: parsed.OIDC_JWKS_CACHE_TTL,
  } as const;
});
