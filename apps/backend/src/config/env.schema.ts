import { z } from "zod"

// Define a strict schema for environment variables
export const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),

  // Frontend/Vite integration
  VITE_ORIGIN: z.string().url().optional(),
  VITE_BASE: z.string().default("/"),

  // Host/URL settings for OGP and links
  PUBLIC_URL: z.string().url().optional(),

  // Security and trust proxy
  TRUST_PROXY: z
    .union([z.literal("true"), z.literal("false"), z.coerce.number().int().nonnegative()])
    .default("false"),
})

export type Env = z.infer<typeof EnvSchema>
