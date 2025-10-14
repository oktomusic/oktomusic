import { registerAs } from "@nestjs/config";

export default registerAs("app", () => {
  const env = process.env.NODE_ENV ?? "development";
  return {
    env,
    isDev: env === "development",
    isProd: env === "production",
    isTest: env === "test",
  } as const;
});
