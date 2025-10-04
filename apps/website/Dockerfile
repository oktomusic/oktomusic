# syntax=docker/dockerfile:1
# check=error=true

# Build stage
FROM node:22-alpine AS builder

# Enable corepack for pnpm
RUN corepack enable

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy website app package.json and docs
COPY apps/website/package.json apps/website/
COPY docs/ docs/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @oktomusic/website...

# Copy website configuration
COPY apps/website/ apps/website/

# Build the website
WORKDIR /app/apps/website
RUN pnpm build

# Production stage
FROM caddy:2-alpine

# Copy built static files
COPY --from=builder /app/apps/website/.vitepress/dist /srv

# Create basic Caddyfile for static file serving
RUN echo -e "{\n\tauto_https off\n}\n\n:80 {\n\troot * /srv\n\tfile_server\n\ttry_files {path} /index.html\n}" > /etc/caddy/Caddyfile

EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
