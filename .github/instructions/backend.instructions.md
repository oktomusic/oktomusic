---
applyTo: "apps/backend/**/*.ts"
description: Instructions for Backend
---

Never use HTTP codes directly. Always use the `HttpStatus` enum from `@nestjs/common`.

Each endpoint with a request body must validate the body using Zod schemas defined in the `@oktomusic/api-schemas` package.

When defining API endpoints, use decorators from `@nestjs/swagger` to document the API. The body schema must be documented with the schema extracted from the Zod object (also exported by `@oktomusic/api-schemas`).

NEVER EVER read environment variables directly using `process.env`. Always use the `ConfigService` from `@nestjs/config` with declared type-safe schemas to access configuration values. Configuration schemas using Zod are in the `config` directory.
