import { registerAs } from "@nestjs/config";
import z from "zod";

import { zBinaryPath, zFolderPath } from "../../utils/zod";

const AppConfigSchema = z.object({
  /**
   * Application environment.
   * Can be "development", "production", or "test".
   * Default: "development"
   */
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
  APP_LIBRARY_PATH: zFolderPath("Library"),
  APP_INTERMEDIATE_PATH: zFolderPath("Intermediate", true),
  FFMPEG_PATH: zBinaryPath("FFMpeg", ["-version"]).optional(),
  FFPROBE_PATH: zBinaryPath("FFProbe", ["-version"]).optional(),
  METAFLAC_PATH: zBinaryPath("Metaflac", ["--version"]).optional(),
} as const);

export interface AppConfig {
  readonly env: "development" | "production" | "test";
  readonly databaseUrl: string;
  readonly isDev: boolean;
  readonly isProd: boolean;
  readonly isTest: boolean;
  readonly sessionSecret: string;
  readonly libraryPath: string;
  readonly intermediatePath: string;
  readonly ffmpegPath: string | undefined;
  readonly ffprobePath: string | undefined;
  readonly metaflacPath: string | undefined;
}

export default registerAs("app", (): AppConfig => {
  const parsed = AppConfigSchema.parse(process.env);

  return {
    env: parsed.NODE_ENV,
    databaseUrl: parsed.DATABASE_URL,
    isDev: parsed.NODE_ENV === "development",
    isProd: parsed.NODE_ENV === "production",
    isTest: parsed.NODE_ENV === "test",
    sessionSecret: parsed.SESSION_SECRET,
    libraryPath: parsed.APP_LIBRARY_PATH,
    intermediatePath: parsed.APP_INTERMEDIATE_PATH,
    ffmpegPath: parsed.FFMPEG_PATH,
    ffprobePath: parsed.FFPROBE_PATH,
    metaflacPath: parsed.METAFLAC_PATH,
  } as const;
});
