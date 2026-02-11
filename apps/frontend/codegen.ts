import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
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
        nonOptionalTypename: true,
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: false,
          defaultValue: false,
        },
      },
    },
  },
};

export default config;
