---
applyTo: "**/*.ts"
description: Instructions for TypeScript files
---

# Imports

Imports must be ordered as follows:

1. Built-in Node.js modules (e.g., `fs`, `path`, etc.) These must be imported with the `node:` prefix.
2. External packages from `node_modules`.
   - If in backend scope, group `@nestjs/*` packages first (by order of importance), then other packages alphabetically.
   - If in frontend scope, group `react` and `react-dom` first, then other packages alphabetically.
3. Internal packages from the monorepo (e.g., `@oktomusic/api-schemas`, `@oktomusic/lyrics`, etc.) alphabetically.
4. Relative imports from the current package

Each of these groups must be separated by a single blank line.

# Interfaces, Types and objects

When defining interfaces, always use the `readonly` modifier when possible.

When defining objects that should typically not be modified in their lifetime, use `as const` to ensure immutability.
