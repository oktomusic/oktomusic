import z from "zod";

export const AuthSessionResSchema = z
  .object({
    authenticated: z.boolean().meta({
      description: "Whether the user is authenticated",
      example: true,
    }),
    userInfo: z
      .object({
        sub: z.string().meta({
          description: "The OIDC subject identifier",
          example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        preferred_username: z.string().optional().meta({
          description: "The user's preferred username",
          example: "john.doe",
        }),
        email: z.string().email().optional().meta({
          description: "The user's email address",
          example: "john.doe@example.com",
        }),
        name: z.string().optional().meta({
          description: "The user's full name",
          example: "John Doe",
        }),
      })
      .passthrough()
      .optional()
      .meta({
        description: "User information from OIDC provider (when authenticated)",
      }),
  })
  .strict();

export const AuthSessionResJSONSchema = z.toJSONSchema(AuthSessionResSchema, {
  unrepresentable: "throw",
});

export type AuthSessionResInput = z.input<typeof AuthSessionResSchema>;
export type AuthSessionRes = z.output<typeof AuthSessionResSchema>;
