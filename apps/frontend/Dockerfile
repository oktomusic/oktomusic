# syntax=docker/dockerfile:1
# check=error=true

FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

LABEL org.opencontainers.image.title="Oktomusic Frontend"
LABEL org.opencontainers.image.description="Media server"
LABEL org.opencontainers.image.authors="AFCMS <afcm.contact@gmail.com>"
LABEL org.opencontainers.image.licenses="AGPL-3.0-only"
LABEL org.opencontainers.image.source="https://github.com/oktomusic/oktomusic"
LABEL io.artifacthub.package.readme-url="https://raw.githubusercontent.com/oktomusic/oktomusic/refs/heads/master/README.md"
LABEL io.artifacthub.package.category="storage"
LABEL io.artifacthub.package.keywords="music,server"
LABEL io.artifacthub.package.license="AGPL-3.0-only"
LABEL io.artifacthub.package.maintainers='[{"name":"AFCMS","email":"afcm.contact@gmail.com"}]'

RUN corepack enable pnpm

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

COPY apps/frontend/package.json apps/frontend/

RUN --mount=type=cache,id=pnpm,target="/pnpm/store" pnpm install --frozen-lockfile --filter @oktomusic/frontend...

COPY apps/frontend/ apps/frontend/

WORKDIR /app/apps/frontend
RUN pnpm build

FROM caddy:2-alpine

COPY --from=builder /app/apps/frontend/dist /srv

COPY apps/frontend/Caddyfile /etc/caddy/Caddyfile

EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
