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
  LIBRARY_PATH: zFolderPath("Library"),
  INTERMEDIATE_PATH: zFolderPath("Intermediate", true),
  FFMPEG_PATH: zBinaryPath("FFMpeg", ["-version"]).optional(),
  FFPROBE_PATH: zBinaryPath("FFProbe", ["-version"]).optional(),
  METAFLAC_PATH: zBinaryPath("Metaflac", ["--version"]).optional(),
});

export interface AppConfig {
  env: "development" | "production" | "test";
  databaseUrl: string;
  isDev: boolean;
  isProd: boolean;
  isTest: boolean;
  sessionSecret: string;
  libraryPath: string;
  intermediatePath: string;
  ffmpegPath: string | undefined;
  ffprobePath: string | undefined;
  metaflacPath: string | undefined;
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
    libraryPath: parsed.LIBRARY_PATH,
    intermediatePath: parsed.INTERMEDIATE_PATH,
    ffmpegPath: parsed.FFMPEG_PATH,
    ffprobePath: parsed.FFPROBE_PATH,
    metaflacPath: parsed.METAFLAC_PATH,
  } as const;
});
