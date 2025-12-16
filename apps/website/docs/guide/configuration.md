The configuration is provided with environment variables.

## App configuration

| Name                    | Description                                                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`              | Application environment. One of `development`, `production`, or `test`. Default: `development`.                             |
| `SESSION_SECRET`        | Secret string used for session encryption. Required. Keep secret in production.                                             |
| `APP_LIBRARY_PATH`      | Path to the music library folder. Must exist and be a directory; the path is resolved at startup.                           |
| `APP_INTERMEDIATE_PATH` | Path to store intermediate files (transcoding, etc) folder. Must exist and be a directory; the path is resolved at startup. |
| `FFMPEG_PATH`           | Optional path to the `ffmpeg` binary.                                                                                       |
| `FFPROBE_PATH`          | Optional path to the `ffprobe` binary.                                                                                      |
| `METAFLAC_PATH`         | Optional path to the `metaflac` binary.                                                                                     |

## HTTP configuration

| Name          | Description                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------- |
| `PORT`        | Port number for the HTTP server to listen on. Default: `3000`.                                |
| `TRUST_PROXY` | Enable reverse proxy support (can be `true`, `false`, or specific proxies). Default: `false`. |

## Valkey configuration

Valkey is used for session and queue storage.

| Name              | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `VALKEY_HOST`     | Hostname of the Valkey server. Default: `localhost`. |
| `VALKEY_PORT`     | Port number for Valkey. Default: `6379`.             |
| `VALKEY_PASSWORD` | Optional password for Valkey (nullable).             |

## OpenID Connect configuration

The backend supports authenticating users via an OpenID Connect provider. The following variables configure the OIDC client used by the NestJS backend.

| Name                       | Description                                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `OIDC_ISSUER`              | Base URL of the OIDC issuer (discovery endpoint base). Must be a valid URL (e.g. `https://auth.example.com/realms/main`).                              |
| `OIDC_CLIENT_ID`           | Client ID registered with the OIDC provider. Identifies the backend as a relying party.                                                                |
| `OIDC_CLIENT_SECRET`       | Client secret for token exchange. Keep this secret in production (use CI secrets or a vault).                                                          |
| `OIDC_REDIRECT_URI`        | Redirect URI that the provider will redirect back to after authentication. Must be a valid URL and match provider configuration.                       |
| `OIDC_LOGOUT_REDIRECT_URI` | Optional post-logout redirect URI (frontchannel logout). If set, users are redirected here after logging out at the provider.                          |
| `OIDC_SCOPES`              | Scopes requested during authentication. Default: `openid profile offline_access`. `offline_access` enables refresh token support.                      |
| `OIDC_RESPONSE_TYPE`       | OIDC response type used for the authorization request. Typically `code` for the authorization code flow. Default: `code`.                              |
| `OIDC_AUTO_DISCOVERY`      | Whether to automatically fetch the provider's discovery document. Defaults to `true`. Set to `false` to configure endpoints manually.                  |
| `OIDC_JWKS_CACHE_TTL`      | Optional JWKS cache TTL (seconds) used when validating tokens to avoid frequent requests to the provider. Default: `3600`.                             |
| `OIDC_ROLES_PATH`          | JSON path used to extract user roles from the access token response. Supports `<client_id>` placeholder. Default: `resource_access.<client_id>.roles`. |
