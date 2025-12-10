import { z } from "zod";

export const LyricsSchema = z.array(
  z.object({
    ts: z.number().positive().describe("timestamp start in milliseconds"),
    te: z.number().positive().describe("timestamp end in milliseconds"),
    l: z.array(
      z.object({
        c: z.string().describe("word or character"),
        d: z
          .number()
          .positive()
          .describe("duration in milliseconds since the start of the line"),
      }),
    ),
    t: z.string().describe("full text of the line"),
  }),
);

export type Lyrics = z.output<typeof LyricsSchema>;
