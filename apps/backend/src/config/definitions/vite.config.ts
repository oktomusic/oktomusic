import { registerAs } from "@nestjs/config";
import z from "zod";

const ViteConfigSchema = z.object({
  /**
   * Origin URL for the Vite server.
   * Default (development): "http://localhost:5173"
   * Default (production): undefined
   * Used for generating absolute URLs in emails, etc.
   */
  VITE_ORIGIN: z.url().optional().default("http://localhost:5173"),
  /**
   * Base path for the Vite application.
   * Default: "/"
   * Should match the `base` option in Vite config.
   */
  VITE_BASE: z.string().default("/"),
});

export interface ViteConfig {
  /** Origin URL for the Vite server */
  origin: string;
  /** Base path for the Vite application */
  base: string;
}

export default registerAs("vite", () => {
  const parsed = ViteConfigSchema.parse(process.env);

  return {
    origin: parsed.VITE_ORIGIN,
    base: parsed.VITE_BASE,
  } as const;
});
