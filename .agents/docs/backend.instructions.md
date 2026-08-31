---
applyTo: "apps/backend/**/*.ts"
description: Instructions for Backend
---

# Backend

- Use `HttpStatus` from `@nestjs/common`, not numeric HTTP status codes
- Validate every request body with a Zod schema from `@oktomusic/api-schemas`
- Document endpoints with `@nestjs/swagger`, including the exported JSON body schema
- Access environment configuration through typed `ConfigService` schemas from the `config` directory; never read `process.env` directly
