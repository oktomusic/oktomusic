# syntax=docker/dockerfile:1
# check=error=true

# Supported base images:
# - node:26-alpine (builder and production)
# - dhi.io/node:26-alpine3.24-dev (builder and production)
# - dhi.io/node:26-alpine3.24 (production)

ARG IMAGE_BUILDER=dhi.io/node:26-alpine3.24-dev
ARG IMAGE_PROD=dhi.io/node:26-alpine3.24

FROM --platform=$BUILDPLATFORM ${IMAGE_BUILDER} AS builder

LABEL org.opencontainers.image.title="Oktomusic"
LABEL org.opencontainers.image.description="Music streaming server"
LABEL org.opencontainers.image.authors="AFCMS <afcm.contact@gmail.com>"
LABEL org.opencontainers.image.licenses="AGPL-3.0-only"
LABEL org.opencontainers.image.source="https://github.com/oktomusic/oktomusic"
LABEL io.artifacthub.package.readme-url="https://raw.githubusercontent.com/oktomusic/oktomusic/refs/heads/master/README.md"
LABEL io.artifacthub.package.category="skip-prediction"
LABEL io.artifacthub.package.keywords="music,server,streaming"
LABEL io.artifacthub.package.license="AGPL-3.0-only"
LABEL io.artifacthub.package.maintainers='[{"name":"AFCMS","email":"afcm.contact@gmail.com"}]'

RUN npm install --global pnpm@12

ARG TARGETOS
ARG TARGETARCH

WORKDIR /usr/src/app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

COPY packages/api-schemas/package.json packages/api-schemas/
COPY packages/metaflac-parser/package.json packages/metaflac-parser/
COPY packages/lyrics/package.json packages/lyrics/
COPY packages/playlists/package.json packages/playlists/
COPY packages/vibrant/package.json packages/vibrant/
COPY packages/meta-tags/package.json packages/meta-tags/
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/

RUN --mount=type=cache,id=pnpm,target="/pnpm/store" \
  mkdir -p .agents/skills && \
  pnpm install --frozen-lockfile \
  --filter @oktomusic/metaflac-parser \
  --filter @oktomusic/lyrics \
  --filter @oktomusic/playlists \
  --filter @oktomusic/api-schemas \
  --filter @oktomusic/vibrant \
  --filter @oktomusic/meta-tags \
  --filter @oktomusic/backend \
  --filter @oktomusic/frontend

COPY packages/api-schemas/ packages/api-schemas/
COPY packages/metaflac-parser/ packages/metaflac-parser/
COPY packages/lyrics/ packages/lyrics/
COPY packages/playlists/ packages/playlists/
COPY packages/vibrant/ packages/vibrant/
COPY packages/meta-tags/ packages/meta-tags/
COPY apps/backend/ apps/backend/
COPY apps/frontend/ apps/frontend/

# Build the metaflac-parser package
RUN pnpm run --filter @oktomusic/metaflac-parser build

# Build the api-schemas package
RUN pnpm run --filter @oktomusic/api-schemas build

# Build the lyrics package
RUN pnpm run --filter @oktomusic/lyrics build

# Build the playlists package
RUN pnpm run --filter @oktomusic/playlists build

# Build the vibrant package
RUN pnpm run --filter @oktomusic/vibrant build

# Build the meta-tags package
RUN pnpm run --filter @oktomusic/meta-tags build

# Build the frontend
RUN pnpm run --filter @oktomusic/frontend build

# Build the backend
RUN pnpm run --filter @oktomusic/backend db:generate
RUN pnpm run --filter @oktomusic/backend build

# Copy frontend dist to backend's public directory (including hidden .vite directory)
RUN mkdir -p apps/backend/dist/public && \
  cp -r apps/frontend/dist/. apps/backend/dist/public/

# Create a portable, pruned backend bundle for production image
RUN pnpm --filter @oktomusic/backend --prod deploy /prod/backend

FROM ghcr.io/oktomusic/ffmpeg-custom:0.6.0 AS ffmpeg

# Select runtime libraries for the production architecture.
FROM ${IMAGE_BUILDER} AS runtime-libs

FROM ${IMAGE_PROD} AS production

ENV NODE_ENV=production

EXPOSE 3000

WORKDIR /usr/src/app

# Prisma's schema engine requires OpenSSL shared libraries.
COPY --from=runtime-libs --chmod=a=r /usr/lib/libssl.so.3 /usr/lib/libcrypto.so.3 /usr/lib/

COPY --from=ffmpeg --chmod=a=rx \
  /usr/local/bin/ffmpeg \
  /usr/local/bin/ffprobe \
  /usr/local/bin/metaflac \
  /usr/local/bin/

ENV FFMPEG_PATH=/usr/local/bin/ffmpeg
ENV FFPROBE_PATH=/usr/local/bin/ffprobe
ENV METAFLAC_PATH=/usr/local/bin/metaflac

# Copy deployed backend artifact with isolated production dependencies
COPY --from=builder --chmod=a=rX /prod/backend/ ./

# Copy compiled backend output and generated Prisma client used at runtime
COPY --from=builder --chmod=a=rX /usr/src/app/apps/backend/dist ./dist

# Copy entrypoint and healthcheck scripts
COPY --chmod=a=r scripts/docker/entrypoint.ts scripts/docker/healthcheck.ts /

ENTRYPOINT ["node", "/entrypoint.ts"]

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 \
  CMD ["node", "/healthcheck.ts"]

