import z from "zod";

export const AuthCallbackResSchema = z
  .object({
    success: z.boolean().meta({
      description: "Whether the authentication was successful",
      example: true,
    }),
  })
  .strict();

export const AuthCallbackResJSONSchema = z.toJSONSchema(
  AuthCallbackResSchema,
  {
    unrepresentable: "throw",
  },
);

export type AuthCallbackResInput = z.input<typeof AuthCallbackResSchema>;
export type AuthCallbackRes = z.output<typeof AuthCallbackResSchema>;
