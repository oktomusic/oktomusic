import type { Config } from "jest";

const config: Config = {
  projects: [
    {
      displayName: "@oktomusic/backend",
      testEnvironment: "node",
      rootDir: "./apps/backend",
      testMatch: [
        "<rootDir>/src/**/*.spec.ts",
        "<rootDir>/test/**/*.e2e-spec.ts",
      ],
      preset: "ts-jest",
      moduleFileExtensions: ["js", "json", "ts"],
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
