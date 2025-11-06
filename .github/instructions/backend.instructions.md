---
applyTo: "apps/backend/**/*.ts"
description: Instructions for Backend
---

Never use HTTP codes directly. Always use the `HttpStatus` enum from `@nestjs/common`.

Each endpoint with a request body must validate the body using Zod schemas defined in the `@oktomusic/api-schemas` package.

When defining API endpoints, use decorators from `@nestjs/swagger` to document the API. The body schema must be documented with the schema extracted from the Zod object (also exported by `@oktomusic/api-schemas`).
