import { registerAs } from "@nestjs/config";
import z from "zod";

const AppConfigSchema = z.object({
  /**
   * Application environment.
   * Can be "development", "production", or "test".
   * Default: "development"
   */
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  SESSION_SECRET: z.string().min(1),
});

export interface AppConfig {
  env: "development" | "production" | "test";
  isDev: boolean;
  isProd: boolean;
  isTest: boolean;
  sessionSecret: string;
}

export default registerAs("app", (): AppConfig => {
  const parsed = AppConfigSchema.parse(process.env);

  return {
    env: parsed.NODE_ENV,
    isDev: parsed.NODE_ENV === "development",
    isProd: parsed.NODE_ENV === "production",
    isTest: parsed.NODE_ENV === "test",
    sessionSecret: parsed.SESSION_SECRET,
  } as const;
});
