---
applyTo: "**/*.ts,**/*.tsx"
description: Instructions for TypeScript files
---

# Imports

Order imports in groups separated by one blank line:

1. Node.js built-ins using the `node:` prefix
2. External packages, alphabetically
3. Internal `@oktomusic/*` packages, alphabetically
4. Relative imports

Within external packages, place `@nestjs/*` first in backend code and `react` plus `react-dom` first in frontend code.

# Types and objects

- Mark interface properties and arrays `readonly` when they should not change
- Prefer `readonly T[]` to `ReadonlyArray<T>`
- Use `as const` for immutable object literals
- Use `satisfies` to validate object shapes without widening literal types

# Zod

Use `z.output<>` instead of `z.infer<>` so output types remain distinct from `z.input<>`.
