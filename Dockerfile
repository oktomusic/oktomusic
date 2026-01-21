# syntax=docker/dockerfile:1
# check=error=true

FROM --platform=$BUILDPLATFORM node:24-alpine AS builder

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

RUN corepack enable pnpm

ARG TARGETOS
ARG TARGETARCH

WORKDIR /usr/src/app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

COPY packages/vite-sri-manifest/package.json packages/vite-sri-manifest/
COPY packages/api-schemas/package.json packages/api-schemas/
COPY packages/metaflac-parser/package.json packages/metaflac-parser/
COPY packages/lyrics/package.json packages/lyrics/
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/

RUN --mount=type=cache,id=pnpm,target="/pnpm/store" \
  pnpm install --frozen-lockfile \
  --filter @oktomusic/vite-sri-manifest \
  --filter @oktomusic/metaflac-parser \
  --filter @oktomusic/lyrics \
  --filter @oktomusic/api-schemas \
  --filter @oktomusic/backend \
  --filter @oktomusic/frontend

COPY packages/vite-sri-manifest/ packages/vite-sri-manifest/
COPY packages/api-schemas/ packages/api-schemas/
COPY packages/metaflac-parser/ packages/metaflac-parser/
COPY packages/lyrics/ packages/lyrics/
COPY apps/backend/ apps/backend/
COPY apps/frontend/ apps/frontend/

# Build the vite-sri-manifest package first
RUN pnpm run --filter @oktomusic/vite-sri-manifest build

# Build the metaflac-parser package first
RUN pnpm run --filter @oktomusic/metaflac-parser build

# Build the api-schemas package first
RUN pnpm run --filter @oktomusic/api-schemas build

# Build the lyrics package first
RUN pnpm run --filter @oktomusic/lyrics build

# Build the frontend
RUN pnpm run --filter @oktomusic/frontend build

# Build the backend
RUN pnpm run --filter @oktomusic/backend db:generate
RUN pnpm run --filter @oktomusic/backend build

# Copy frontend dist to backend's public directory (including hidden .vite directory)
RUN mkdir -p apps/backend/dist/public && \
  cp -r apps/frontend/dist/. apps/backend/dist/public/

FROM ghcr.io/oktomusic/ffmpeg-custom:0.2.0 AS ffmpeg

FROM node:24-alpine AS production

RUN corepack enable pnpm
RUN apk add --no-cache ca-certificates

ENV NODE_ENV=production
ENV UPDATE_CA=

EXPOSE 3000

WORKDIR /usr/src/app

COPY --from=ffmpeg /usr/local/bin/ffmpeg /usr/local/bin/ffmpeg
COPY --from=ffmpeg /usr/local/bin/ffprobe /usr/local/bin/ffprobe
COPY --from=ffmpeg /usr/local/bin/metaflac /usr/local/bin/metaflac

ENV FFMPEG_PATH=/usr/local/bin/ffmpeg
ENV FFPROBE_PATH=/usr/local/bin/ffprobe
ENV METAFLAC_PATH=/usr/local/bin/metaflac

# Copy package files for production dependencies
COPY --from=builder /usr/src/app/pnpm-workspace.yaml /usr/src/app/package.json /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/apps/backend/package.json ./apps/backend/
COPY --from=builder /usr/src/app/packages/api-schemas/package.json ./packages/api-schemas/
COPY --from=builder /usr/src/app/packages/lyrics/package.json ./packages/lyrics/
COPY --from=builder /usr/src/app/packages/metaflac-parser/package.json ./packages/metaflac-parser/

# Install production dependencies only
RUN --mount=type=cache,id=pnpm,target="/pnpm/store" \
  pnpm install --frozen-lockfile --prod \
  --filter @oktomusic/api-schemas... \
  --filter @oktomusic/metaflac-parser... \
  --filter @oktomusic/backend...

# Copy Prisma schema and migrations for runtime migration
COPY --from=builder /usr/src/app/apps/backend/prisma ./apps/backend/prisma

# Copy Prisma config (required to apply migrations)
COPY --from=builder /usr/src/app/apps/backend/prisma.config.ts ./apps/backend/prisma.config.ts

# Copy built backend and frontend
COPY --from=builder /usr/src/app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /usr/src/app/packages/api-schemas/dist ./packages/api-schemas/dist
COPY --from=builder /usr/src/app/packages/lyrics/dist ./packages/lyrics/dist
COPY --from=builder /usr/src/app/packages/metaflac-parser/dist ./packages/metaflac-parser/dist

# Copy the generated Prisma client
COPY --from=builder /usr/src/app/apps/backend/src/generated ./apps/backend/src/generated

# Create entrypoint script for running migrations before starting the app
RUN <<'EOF'
cat > /entrypoint.sh <<'SH'
#!/bin/sh
set -e

if [ -n "$UPDATE_CA" ]; then
  echo "Updating CA certificates..."
  update-ca-certificates
fi

cd /usr/src/app/apps/backend
echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Migrations completed successfully"
cd /usr/src/app
exec node --use-system-ca apps/backend/dist/main.js
SH
chmod +x /entrypoint.sh
EOF

ENTRYPOINT ["/entrypoint.sh"]

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 \
  CMD wget -qO- http://localhost:3000/api/health >/dev/null 2>&1 || exit 1

