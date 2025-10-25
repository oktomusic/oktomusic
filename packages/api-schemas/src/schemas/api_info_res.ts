import z from "zod";

export const ApiInfoResSchema = z
  .object({
    version: z
      .string()
      .regex(/^\d+\.\d+\.\d+(-.+)?$/)
      .meta({ description: "The version of the app", example: "0.0.1" }),
    oidc: z.object({
      issuer: z.url().meta({
        description: "The OIDC issuer URL",
        example: "https://keycloak.example.com/realms/myrealm",
      }),
      client_id: z.string().meta({
        description: "The OIDC client ID",
        example: "oktomusic",
      }),
    }),
  })
  .strict();

export const ApiInfoResJSONSchema = z.toJSONSchema(ApiInfoResSchema, {
  unrepresentable: "throw",
});

export type ApiInfoResInput = z.input<typeof ApiInfoResSchema>;
export type ApiInfoRes = z.output<typeof ApiInfoResSchema>;
