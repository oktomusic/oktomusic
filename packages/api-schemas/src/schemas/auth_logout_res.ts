import z from "zod";

export const AuthLogoutResSchema = z
  .object({
    logoutUrl: z.url().optional().meta({
      description:
        "The OIDC end session URL to redirect the user to (if configured)",
      example:
        "https://keycloak.example.com/realms/myrealm/protocol/openid-connect/logout?...",
    }),
    success: z.boolean().meta({
      description: "Whether the logout was successful",
      example: true,
    }),
  })
  .strict();

export const AuthLogoutResJSONSchema = z.toJSONSchema(AuthLogoutResSchema, {
  unrepresentable: "throw",
});

export type AuthLogoutResInput = z.input<typeof AuthLogoutResSchema>;
export type AuthLogoutRes = z.output<typeof AuthLogoutResSchema>;
