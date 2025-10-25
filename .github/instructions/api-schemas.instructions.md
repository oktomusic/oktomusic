---
applyTo: "packages/api-schemas/**/*.ts"
description: Instructions for API Schemas package
---

API schemas should be defined in a common package to ensure consistency across backend and frontend.

These schemas are defined using Zod 4 (https://zod.dev).

Each schema should have it's own file in the `packages/api-schemas/src/schemas/` directory.

For example, to define a schema for an API response, create a file `api_info_res.ts`:

The exported elements should include the Zod schema itself, as well as TypeScript types for the input and output of the schema.

```typescript
import z from "zod";

export const ApiInfoResSchema = z.object({
  id: z.number(),
  message: z.string(),
});

export const ApiInfoResJSONSchema = z.toJSONSchema(ApiInfoResSchema, {
  unrepresentable: "throw",
});

export type ApiInfoResInput = z.input<typeof ApiInfoResSchema>;
export type ApiInfoRes = z.output<typeof ApiInfoResSchema>;
```

On a side note, `z.string().url()` is deprecated in favor of `z.url()`.
