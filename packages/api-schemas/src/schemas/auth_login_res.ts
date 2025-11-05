import z from "zod";

export const AuthLoginResSchema = z
  .object({
    authUrl: z.url().meta({
      description: "The OIDC authorization URL to redirect the user to",
      example:
        "https://keycloak.example.com/realms/myrealm/protocol/openid-connect/auth?...",
    }),
  })
  .strict();

export const AuthLoginResJSONSchema = z.toJSONSchema(AuthLoginResSchema, {
  unrepresentable: "throw",
});

export type AuthLoginResInput = z.input<typeof AuthLoginResSchema>;
export type AuthLoginRes = z.output<typeof AuthLoginResSchema>;
