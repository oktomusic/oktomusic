import { registerAs } from "@nestjs/config";
import z from "zod";

const ValkeyConfigSchema = z.object({
  VALKEY_HOST: z.string().default("localhost"),
  VALKEY_PORT: z.coerce.number().int().positive().max(65535).default(6379),
  VALKEY_PASSWORD: z.string().nullable().default(null),
});

export interface ValkeyConfig {
  valkeyHost: string;
  valkeyPort: number;
  valkeyPassword: string | null;
}

export default registerAs("valkey", (): ValkeyConfig => {
  const parsed = ValkeyConfigSchema.parse(process.env);

  return {
    valkeyHost: parsed.VALKEY_HOST,
    valkeyPort: parsed.VALKEY_PORT,
    valkeyPassword: parsed.VALKEY_PASSWORD,
  } as const;
});
