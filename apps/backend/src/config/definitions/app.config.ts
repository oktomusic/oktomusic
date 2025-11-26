import fs from "node:fs";
import path from "node:path";

import { registerAs } from "@nestjs/config";
import z from "zod";
import { zBinaryPath } from "src/utils/zod";

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
  LIBRARY_PATH: z.string().transform((arg, ctx) => {
    const libPath = path.resolve(arg);
    const exist = fs.existsSync(libPath);
    const isDir = exist && fs.lstatSync(libPath).isDirectory();

    if (!isDir) {
      ctx.issues.push({
        code: "custom",
        message: "Library path must exist and be a directory",
        input: libPath,
      });
      return z.NEVER;
    }

    return libPath;
  }),
  FFMPEG_PATH: zBinaryPath("FFMpeg", ["-version"]).optional(),
  FFPROBE_PATH: zBinaryPath("FFProbe", ["-version"]).optional(),
  METAFLAC_PATH: zBinaryPath("Metaflac", ["--version"]).optional(),
});

export interface AppConfig {
  env: "development" | "production" | "test";
  isDev: boolean;
  isProd: boolean;
  isTest: boolean;
  sessionSecret: string;
  libraryPath: string;
  ffmpegPath: string | undefined;
  ffprobePath: string | undefined;
  metaflacPath: string | undefined;
}

export default registerAs("app", (): AppConfig => {
  const parsed = AppConfigSchema.parse(process.env);

  return {
    env: parsed.NODE_ENV,
    isDev: parsed.NODE_ENV === "development",
    isProd: parsed.NODE_ENV === "production",
    isTest: parsed.NODE_ENV === "test",
    sessionSecret: parsed.SESSION_SECRET,
    libraryPath: parsed.LIBRARY_PATH,
    ffmpegPath: parsed.FFMPEG_PATH,
    ffprobePath: parsed.FFPROBE_PATH,
    metaflacPath: parsed.METAFLAC_PATH,
  } as const;
});
