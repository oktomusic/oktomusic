---
applyTo: "packages/api-schemas/**/*.ts"
description: Instructions for API Schemas package
---

# API schemas

Define shared request and response schemas with Zod 4. Put each schema in its own file under `packages/api-schemas/src/schemas/`.

For a schema named `Example`, export:

- `ExampleSchema`
- `ExampleJSONSchema` from `z.toJSONSchema(ExampleSchema, { unrepresentable: "throw" })`
- `ExampleInput` from `z.input<typeof ExampleSchema>`
- `Example` from `z.output<typeof ExampleSchema>`

Use `z.url()` instead of the deprecated `z.string().url()`.
