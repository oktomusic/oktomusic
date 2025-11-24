import z from "zod";

export const IndexingStatusResSchema = z
  .object({
    jobId: z.string().meta({
      description: "The ID of the indexing job",
      example: "1",
    }),
    status: z.enum(["queued", "active", "completed", "failed"]).meta({
      description: "The current status of the job",
      example: "active",
    }),
    progress: z
      .number()
      .min(0)
      .max(100)
      .optional()
      .meta({
        description: "The progress percentage of the job (0-100)",
        example: 50,
      }),
    error: z
      .string()
      .optional()
      .meta({
        description: "Error message if the job failed",
        example: "Failed to access library path",
      }),
    completedAt: z
      .string()
      .datetime()
      .optional()
      .meta({
        description: "ISO 8601 timestamp when the job completed",
        example: "2024-01-01T12:00:00Z",
      }),
  })
  .strict();

export const IndexingStatusResJSONSchema = z.toJSONSchema(
  IndexingStatusResSchema,
  {
    unrepresentable: "throw",
  },
);

export type IndexingStatusResInput = z.input<typeof IndexingStatusResSchema>;
export type IndexingStatusRes = z.output<typeof IndexingStatusResSchema>;
