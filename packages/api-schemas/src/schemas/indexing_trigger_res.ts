import z from "zod";

export const IndexingTriggerResSchema = z
  .object({
    jobId: z.string().meta({
      description: "The ID of the triggered indexing job",
      example: "1",
    }),
    status: z.enum(["queued", "active", "completed", "failed"]).meta({
      description: "The status of the job",
      example: "queued",
    }),
  })
  .strict();

export const IndexingTriggerResJSONSchema = z.toJSONSchema(
  IndexingTriggerResSchema,
  {
    unrepresentable: "throw",
  },
);

export type IndexingTriggerResInput = z.input<typeof IndexingTriggerResSchema>;
export type IndexingTriggerRes = z.output<typeof IndexingTriggerResSchema>;
