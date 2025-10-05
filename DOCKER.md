# Docker Build Instructions

This document provides instructions for building and running Docker images for the static apps.

## Frontend (Vite React App)

### Build the Image

```bash
docker build -t oktomusic-frontend:latest -f apps/frontend/Dockerfile .
```

### Run the Container

```bash
docker run -p 3000:80 oktomusic-frontend:latest
```

Then open http://localhost:3000 in your browser.

### Cross-Platform Build

To build for multiple platforms (e.g., amd64 and arm64):

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t oktomusic-frontend:latest -f apps/frontend/Dockerfile .
```

## Website (VitePress)

### Build the Image

```bash
docker build -t oktomusic-website:latest -f apps/website/Dockerfile .
```

### Run the Container

```bash
docker run -p 3001:80 oktomusic-website:latest
```

Then open http://localhost:3001 in your browser.

### Cross-Platform Build

To build for multiple platforms (e.g., amd64 and arm64):

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t oktomusic-website:latest -f apps/website/Dockerfile .
```

## Notes

- Both images use Node.js 22 Alpine for the build stage
- Both use Caddy Alpine as the minimal HTTP server for production
- The Caddy configuration includes `try_files {path} /index.html` for SPA routing support
- HTTPS is disabled in the default Caddyfile (HTTP only on port 80)
- Build context is the repository root to access workspace files

### Known Issues

**VitePress Build**: The website app currently has a dependency issue with VitePress 2.0.0-alpha.12 where `vue` is not properly declared as a dependency. To fix this before building the Docker image, run:

```bash
cd apps/website && pnpm add -D vue
```

This issue should be resolved when VitePress reaches a stable release or when the dependency is properly declared in the website's package.json.
