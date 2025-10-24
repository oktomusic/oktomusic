import { registerAs } from "@nestjs/config";
import z from "zod";

const HttpConfigSchema = z.object({
  /**
   * Port number for the HTTP server to listen on.
   * Default: 3000
   */
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  /**
   * Proxy trust setting for the HTTP server.
   * Can be "true", "false", or a comma-separated list of IPs/CIDRs.
   * Default: "false"
   */
  TRUST_PROXY: z.coerce.boolean().default(false),
});

export interface HttpConfig {
  port: number;
  trustProxy: boolean;
}

export default registerAs("http", (): HttpConfig => {
  const parsed = HttpConfigSchema.parse(process.env);

  return {
    port: parsed.PORT,
    trustProxy: parsed.TRUST_PROXY,
  } as const;
});
