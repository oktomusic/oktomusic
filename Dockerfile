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
LABEL io.artifacthub.package.keywords="music,server,streaming"
LABEL io.artifacthub.package.license="AGPL-3.0-only"
LABEL io.artifacthub.package.maintainers='[{"name":"AFCMS","email":"afcm.contact@gmail.com"}]'

RUN corepack enable pnpm

ARG TARGETOS
ARG TARGETARCH

WORKDIR /usr/src/app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

COPY packages/vite-sri-manifest/package.json packages/vite-sri-manifest/
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/

RUN --mount=type=cache,id=pnpm,target="/pnpm/store" pnpm install --frozen-lockfile --filter @oktomusic/vite-sri-manifest --filter @oktomusic/backend --filter @oktomusic/frontend

COPY packages/vite-sri-manifest/ packages/vite-sri-manifest/
COPY apps/backend/ apps/backend/
COPY apps/frontend/ apps/frontend/

# Build the vite-sri-manifest package first
RUN pnpm run --filter @oktomusic/vite-sri-manifest build

# Build the frontend
RUN pnpm run --filter @oktomusic/frontend build

# Build the backend
RUN pnpm run --filter @oktomusic/backend db:generate
RUN pnpm run --filter @oktomusic/backend build

# Copy frontend dist to backend's public directory (including hidden .vite directory)
RUN mkdir -p apps/backend/dist/public && \
    cp -r apps/frontend/dist/. apps/backend/dist/public/

FROM node:22-slim AS production

RUN corepack enable pnpm

ENV NODE_ENV=production

EXPOSE 3000

WORKDIR /usr/src/app

# Copy package files for production dependencies
COPY --from=builder /usr/src/app/pnpm-workspace.yaml /usr/src/app/package.json /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/apps/backend/package.json ./apps/backend/

# Install production dependencies only
RUN --mount=type=cache,id=pnpm,target="/pnpm/store" pnpm install --frozen-lockfile --filter @oktomusic/backend --prod

# Copy built backend and frontend
COPY --from=builder /usr/src/app/apps/backend/dist ./apps/backend/dist

CMD ["node", "apps/backend/dist/src/main.js"]

