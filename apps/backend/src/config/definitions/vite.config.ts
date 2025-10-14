import { registerAs } from "@nestjs/config";

export default registerAs("vite", () => {
  const env = process.env.NODE_ENV ?? "development";
  const isDev = env === "development";
  return {
    origin:
      process.env.VITE_ORIGIN ?? (isDev ? "http://localhost:5173" : undefined),
    base: process.env.VITE_BASE ?? "/",
  } as const;
});
