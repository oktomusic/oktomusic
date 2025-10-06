import type { Config } from "jest";
import { createDefaultPreset } from "ts-jest";

const config: Config = {
  preset: "ts-jest",
  rootDir: "./",
  transform: createDefaultPreset().transform,
  projects: [
    {
      displayName: "@oktomusic/backend",
      testEnvironment: "node",
      testRegex: ["<rootDir>/apps/backend/.*\\.(?:e2e-)?spec\\.ts$"],
      preset: "ts-jest",
      transform: createDefaultPreset().transform,
      //testMatch: ["<rootDir>/apps/backend/src/**/*.test.ts"],
    } as Config,
    {
      displayName: "@oktomusic/frontend",
      testEnvironment: "jsdom",
    } as Config,
  ],
};

export default config;
