import z from "zod";

export const AuthCallbackQuerySchema = z
  .object({
    code: z.string().meta({
      description: "The authorization code from the OIDC provider",
      example: "abc123...",
    }),
    state: z.string().optional().meta({
      description:
        "The state parameter for CSRF protection (if provider doesn't support PKCE)",
      example: "xyz789...",
    }),
  })
  .strict();

export const AuthCallbackQueryJSONSchema = z.toJSONSchema(
  AuthCallbackQuerySchema,
  {
    unrepresentable: "throw",
  },
);

export type AuthCallbackQueryInput = z.input<typeof AuthCallbackQuerySchema>;
export type AuthCallbackQuery = z.output<typeof AuthCallbackQuerySchema>;
