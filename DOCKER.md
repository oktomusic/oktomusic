# Docker Build Instructions

This document provides instructions for building and running Docker images for Oktomusic applications.

## Backend API with Database (Full Stack)

The main Dockerfile at the root of the repository builds the complete Oktomusic application including the backend API and frontend.

### Automatic Database Migrations

The Docker container is configured to automatically run Prisma migrations on startup using the `prisma migrate deploy` command. This ensures that your database schema is always up-to-date when the container starts.

### Using Docker Compose (Recommended)

The easiest way to run the full stack is using Docker Compose:

```bash
# Start both database and application
docker compose up -d

# View logs
docker compose logs -f app

# Stop services
docker compose down
```

This will:
1. Start a PostgreSQL 17 database
2. Build the application image (if not already built)
3. Run database migrations automatically
4. Start the backend API server on http://localhost:3000

### Development with Database Only

To run just the PostgreSQL database for local development:

```bash
# Start the database
docker compose -f compose.dev.yml up -d

# The database will be available at:
# postgresql://oktomusic:oktomusic@localhost:5432/oktomusic
```

### Manual Docker Build and Run

If you prefer to build and run manually:

```bash
# Build the image
docker build -t oktomusic:latest .

# Create a network for the containers (if not already created by compose)
docker network create oktomusic_default

# Start the database (if not already running)
docker compose -f compose.dev.yml up -d

# Run the application
docker run -d \
  --name oktomusic-app \
  --network oktomusic_default \
  -e DATABASE_URL="postgresql://oktomusic:oktomusic@oktomusic-postgres:5432/oktomusic" \
  -e NODE_ENV=production \
  -p 3000:3000 \
  oktomusic:latest
```

> **Note**: The above commands are for development/testing. For production, use Docker secrets or environment files to manage sensitive credentials securely.

### Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string (format: `postgresql://user:password@host:port/database`)
- `NODE_ENV`: Set to `production` for production builds
- `PORT`: Server port (default: 3000)

> **Security Note**: In production environments, use Docker secrets, environment files (.env), or a secure secrets management system to handle sensitive information like database passwords. Never commit credentials to version control.

### Testing the API

Once the container is running, you can test the API:

```bash
# Test the info endpoint
curl http://localhost:3000/api/info

# Should return an array (empty initially, or with data if you've added records)
```

### Container Persistence

The database uses a Docker volume (`postgres_data`) to persist data across container restarts. The application container can be safely:
- Restarted: `docker restart oktomusic-app`
- Recreated: `docker compose up -d --force-recreate`
- Updated: Build a new image and restart

Database migrations will run on every startup but will only apply new migrations that haven't been applied yet.

### Troubleshooting

**Certificate Issues During Build**: The Dockerfile includes workarounds for CI/CD environments that may have certificate issues (specifically, `npm config set strict-ssl false` and `NODE_TLS_REJECT_UNAUTHORIZED=0`). 

For production deployments, you should:
1. Remove these SSL bypass settings from the Dockerfile
2. Ensure proper SSL certificates are available in the build environment
3. Use the `NODE_EXTRA_CA_CERTS` environment variable to point to your certificate bundle if needed
4. Build in an environment with properly configured SSL/TLS

Example for secure production builds:
```dockerfile
# Replace these lines in the Dockerfile:
# RUN npm config set strict-ssl false && npm install -g pnpm@10.18.1
# With:
RUN npm install -g pnpm@10.18.1

# Remove this line from builder stage:
# ENV NODE_TLS_REJECT_UNAUTHORIZED=0
```

**Migration Errors**: Check the container logs with `docker logs <container-name>` to see detailed migration output.

**Connection Issues**: Ensure the database is healthy before starting the app. When using Docker Compose, this is handled automatically via the `depends_on` with `condition: service_healthy`.

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
