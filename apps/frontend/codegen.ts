import type { CodegenConfig } from "@graphql-codegen/cli";

const config = {
  overwrite: true,
  schema: "../backend/src/api/schema.gql",
  documents: ["src/**/*.tsx", "src/**/*.ts"],
  generates: {
    "src/api/graphql/gql/": {
      preset: "client",
      plugins: [],
      config: {
        scalars: {
          DateTime: "Date",
        },
        enumType: "const",
        nonOptionalTypename: true,
      },
    },
  },
} as const satisfies CodegenConfig;

export default config;
