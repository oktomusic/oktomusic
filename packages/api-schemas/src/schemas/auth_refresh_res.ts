import z from "zod";

export const AuthRefreshResSchema = z
  .object({
    success: z.boolean().meta({
      description: "Whether the token refresh was successful",
      example: true,
    }),
  })
  .strict();

export const AuthRefreshResJSONSchema = z.toJSONSchema(AuthRefreshResSchema, {
  unrepresentable: "throw",
});

export type AuthRefreshResInput = z.input<typeof AuthRefreshResSchema>;
export type AuthRefreshRes = z.output<typeof AuthRefreshResSchema>;
