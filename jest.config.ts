import type { Config } from "jest";

const config: Config = {
  projects: [
    {
      displayName: "@oktomusic/backend",
      testEnvironment: "node",
      rootDir: "./apps/backend",
      testMatch: ["<rootDir>/src/**/*.spec.ts"],
      testPathIgnorePatterns: ["<rootDir>/test/"],
      preset: "ts-jest",
      moduleFileExtensions: ["js", "json", "ts"],
      moduleNameMapper: {
        "^src/(.*)$": "<rootDir>/src/$1",
        "^@oktomusic/api-schemas$": "<rootDir>/test/mocks/api-schemas.ts",
        "^openid-client$": "<rootDir>/test/mocks/openid-client.ts",
      },
      transform: {
        "^.+\\.(t|j)s$": "ts-jest",
      },
      transformIgnorePatterns: [
        // Allow transforming our internal ESM package when imported
        "/node_modules/(?!@oktomusic/api-schemas)",
      ],
      collectCoverageFrom: ["**/*.(t|j)s"],
      coverageDirectory: "../../coverage/backend",
    } as Config,
    {
      displayName: "@oktomusic/frontend",
      testEnvironment: "jsdom",
      rootDir: "./apps/frontend",
      testMatch: ["<rootDir>/src/**/*.{test,spec}.{ts,tsx}"],
      preset: "ts-jest",
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            tsconfig: {
              jsx: "react-jsx",
              module: "esnext",
              moduleResolution: "bundler",
              esModuleInterop: true,
              allowSyntheticDefaultImports: true,
            },
          },
        ],
      },
      moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
      moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
      },
      collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
      coverageDirectory: "../../coverage/frontend",
    } as Config,
  ],
};

export default config;
