export type ApiInfoRes = {
  version: string;
  oidc: {
    issuer: string;
    client_id: string;
  };
};

export const ApiInfoResJSONSchema = {
  type: "object",
  properties: {
    version: { type: "string" },
    oidc: {
      type: "object",
      properties: {
        issuer: { type: "string" },
        client_id: { type: "string" },
      },
      required: ["issuer", "client_id"],
      additionalProperties: false,
    },
  },
  required: ["version", "oidc"],
  additionalProperties: true,
} as const;
