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

RUN npm install --global pnpm@10

ARG TARGETOS
ARG TARGETARCH

WORKDIR /usr/src/app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

COPY packages/vite-sri-manifest/package.json packages/vite-sri-manifest/
COPY packages/api-schemas/package.json packages/api-schemas/
COPY packages/metaflac-parser/package.json packages/metaflac-parser/
COPY packages/lyrics/package.json packages/lyrics/
COPY packages/playlists/package.json packages/playlists/
COPY packages/vibrant/package.json packages/vibrant/
COPY packages/meta-tags/package.json packages/meta-tags/
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/

RUN --mount=type=cache,id=pnpm,target="/pnpm/store" \
  pnpm install --frozen-lockfile \
  --filter @oktomusic/vite-sri-manifest \
  --filter @oktomusic/metaflac-parser \
  --filter @oktomusic/lyrics \
  --filter @oktomusic/playlists \
  --filter @oktomusic/api-schemas \
  --filter @oktomusic/vibrant \
  --filter @oktomusic/meta-tags \
  --filter @oktomusic/backend \
  --filter @oktomusic/frontend

COPY packages/vite-sri-manifest/ packages/vite-sri-manifest/
COPY packages/api-schemas/ packages/api-schemas/
COPY packages/metaflac-parser/ packages/metaflac-parser/
COPY packages/lyrics/ packages/lyrics/
COPY packages/playlists/ packages/playlists/
COPY packages/vibrant/ packages/vibrant/
COPY packages/meta-tags/ packages/meta-tags/
COPY apps/backend/ apps/backend/
COPY apps/frontend/ apps/frontend/

# Build the vite-sri-manifest package
RUN pnpm run --filter @oktomusic/vite-sri-manifest build

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

FROM ghcr.io/oktomusic/ffmpeg-custom:0.3.0 AS ffmpeg

FROM node:24-alpine AS production

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

# Copy deployed backend artifact with isolated production dependencies
COPY --from=builder /prod/backend/ ./

# Copy compiled backend output and generated Prisma client used at runtime
COPY --from=builder /usr/src/app/apps/backend/dist ./dist

# Create entrypoint script for running migrations before starting the app
RUN <<'EOF'
cat > /entrypoint.sh <<'SH'
#!/bin/sh
set -e

if [ -n "$UPDATE_CA" ]; then
  echo "Updating CA certificates..."
  update-ca-certificates
fi

cd /usr/src/app
echo "Running Prisma migrations..."
exec node ./node_modules/prisma/build/index.js migrate deploy
echo "Migrations completed successfully"
exec node --use-system-ca dist/main.js
SH
chmod +x /entrypoint.sh
EOF

ENTRYPOINT ["/entrypoint.sh"]

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 \
  CMD wget -qO- http://localhost:3000/api/health >/dev/null 2>&1 || exit 1

