const config = {
  projects: [
    {
      displayName: "@oktomusic/backend",
      testEnvironment: "node",
      rootDir: "./apps/backend",
      testMatch: ["<rootDir>/src/**/*.spec.ts", "<rootDir>/test/**/*.e2e-spec.ts"],
      preset: "ts-jest",
      transform: {
        "^.+\\.ts$": [
          "ts-jest",
          {
            tsconfig: "<rootDir>/tsconfig.spec.json",
          },
        ],
      },
      moduleFileExtensions: ["js", "json", "ts"],
      collectCoverageFrom: ["**/*.(t|j)s"],
      coverageDirectory: "../../coverage/backend",
    },
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
    },
  ],
};

export default config;

