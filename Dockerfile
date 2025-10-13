# syntax=docker/dockerfile:1
# check=error=true

FROM --platform=$BUILDPLATFORM node:22-slim AS builder

LABEL org.opencontainers.image.title="Oktomusic"
LABEL org.opencontainers.image.description="Music streaming server"
LABEL org.opencontainers.image.authors="AFCMS <afcm.contact@gmail.com>"
LABEL org.opencontainers.image.licenses="AGPL-3.0-only"
LABEL org.opencontainers.image.source="https://github.com/oktomusic/oktomusic"
LABEL io.artifacthub.package.readme-url="https://raw.githubusercontent.com/oktomusic/oktomusic/refs/heads/master/README.md"
LABEL io.artifacthub.package.category="skip-prediction"
LABEL io.artifacthub.package.keywords="music,server"
LABEL io.artifacthub.package.license="AGPL-3.0-only"
LABEL io.artifacthub.package.maintainers='[{"name":"AFCMS","email":"afcm.contact@gmail.com"}]'

RUN corepack enable pnpm

ARG TARGETOS
ARG TARGETARCH

WORKDIR /usr/src/app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/

RUN --mount=type=cache,id=pnpm,target="/pnpm/store" pnpm install --frozen-lockfile --filter @oktomusic/backend --filter @oktomusic/frontend

COPY apps/backend/ apps/backend/
COPY apps/frontend/ apps/frontend/

RUN pnpm run --filter @oktomusic/backend build

CMD [ "pnpm", "run", "--filter", "@oktomusic/backend", "start:prod" ]

# FROM node:22-slim AS production

# RUN corepack enable pnpm

# ENV NODE_ENV=production

# EXPOSE 3000

# WORKDIR /usr/src/app

# COPY --from=builder /usr/src/app/apps/backend ./apps/backend






