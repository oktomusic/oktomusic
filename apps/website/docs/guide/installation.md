---
description: Steps to install Oktomusic using Docker Compose
---

[pg_upgrade_docker]: https://github.com/docker-library/postgres/issues/37

# Installation Guide

The supported way to install Oktomusic is by using the provided Docker images.

Here we will describe the steps to get Oktomusic up and running using Docker Compose.

> [!NOTE]
> Oktomusic require the following external services to run:
>
> - [PostgreSQL](https://www.postgresql.org) 18 or higher (database)
> - [Valkey](https://valkey.io) 9 or higher (session and queue storage)
> - An [OpenID Connect](https://openid.net/developers/how-connect-works) provider like [Keycloak](https://www.keycloak.org) or [Authentik](https://goauthentik.io) (user authentication)
>
> Older versions of PostgreSQL and Valkey may work but are not officially tested.

## Prerequisites

- [Docker Engine](https://docs.docker.com/engine) installed on your server system.
- A OpenID Connect provider instance up and running.
  - [Keycloak documentation](https://www.keycloak.org/guides)
  - [Authentik documentation](https://docs.goauthentik.io/install-config/install/docker-compose)

> [!TIP]
> If your target system isn't Linux based, you can also use [Docker Desktop](https://docs.docker.com/desktop) which runs on Windows and macOS.
>
> For production deployments, it's recommended to use a Linux based system and Docker Engine which have better performance than Docker Desktop.

## Docker Compose setup

> [!IMPORTANT]
> This example assumes you already have an OpenID Connect provider (Keycloak, Authentik, …) running and configured.
>
> You must create an OIDC client and set the `OIDC_*` variables accordingly.
>
> See the [OpenID Connect configuration guide](./openid) for more information.

`.env`:

```ini
# PostgreSQL (Prisma connection URL)
DATABASE_URL=postgresql://oktomusic:oktomusic@postgres:5432/oktomusic

# Session encryption secret (generate a long random string)
SESSION_SECRET=change-me-to-a-long-random-secret

# Storage paths inside the container (must exist)
# The library path is considered read-only by the application.
# The intermediate path is used for temporary files (transcoding, lower resolution cover arts, etc).
APP_LIBRARY_PATH=/srv/music
APP_INTERMEDIATE_PATH=/srv/intermediate

# Valkey (session + queue storage)
VALKEY_HOST=valkey
VALKEY_PORT=6379
VALKEY_PASSWORD=change-me

# OpenID Connect
# Example (Keycloak): https://auth.example.com/realms/my-realm-id
OIDC_ISSUER=https://auth.example.com/realms/my-realm-id
OIDC_CLIENT_ID=oktomusic
OIDC_CLIENT_SECRET=change-me
OIDC_ROLES_PATH=resource_access.<client_id>.roles

# These must match your OIDC provider client settings.
# If you expose Oktomusic on https://music.example.com, keep the paths and change the domain.
OIDC_REDIRECT_URI=https://music.example.com/api/auth/callback
OIDC_LOGOUT_REDIRECT_URI=https://music.example.com/

# --- Optional ---
# PORT=3000
# TRUST_PROXY=false
```

`compose.yml`:

```yaml
---
name: Oktomusic
services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_USER: oktomusic
      POSTGRES_PASSWORD: oktomusic
      POSTGRES_DB: oktomusic
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U oktomusic"]
      interval: 5s
      timeout: 5s
      retries: 5

  valkey:
    image: valkey/valkey:9-alpine
    environment:
      VALKEY_PASSWORD: ${VALKEY_PASSWORD}
    command:
      - valkey-server
      - "--port"
      - "6379"
      - "--requirepass"
      - "${VALKEY_PASSWORD}"
      - "--dir"
      - "/data"
      - "--appendonly"
      - "yes"
      - "--appendfilename"
      - "appendonly.aof"
    ports:
      - "6379:6379"
    volumes:
      - valkey_data:/data
    healthcheck:
      test: ["CMD-SHELL", "valkey-cli -a $$VALKEY_PASSWORD ping | grep PONG"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 5s

  app:
    image: ghcr.io/oktomusic/oktomusic:latest
    env_file:
      - ./.env
    ports:
      - "3100:3000"
    volumes:
      # Replace the left side paths with directories on your host.
      # The source library path is set to read-only.
      - /path/to/your/music:/srv/music:ro
      - /path/to/your/intermediate:/srv/intermediate
    depends_on:
      postgres:
        condition: service_healthy
      valkey:
        condition: service_healthy

volumes:
  postgres_data:
  valkey_data:
```

Start the stack:

```bash
docker compose up -d
```

Then open `http://localhost:3100`.

> [!IMPORTANT]
> The app purposely do not support TLS termination directly, which is more or less required by OpenID Connect providers.
>
> To get TLS support, you must run Oktomusic behind a reverse proxy like [Traefik](https://traefik.io), [Caddy](https://caddyserver.com) or [Nginx](https://nginx.org).
>
> It should be pretty straightforward to set up TLS termination with any of these proxies.
>
> You need to enable reverse proxy support in Oktomusic by setting the `TRUST_PROXY` environment variable to `true`.

### Behind a reverse proxy

TODO
