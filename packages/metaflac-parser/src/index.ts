import z from "zod";
import { isrcRegex, parseOutput } from "./utils";

const trackNumberRegex = /^(\d+)\/(\d+)$/;

interface TrackNumber {
  readonly track: number;
  readonly total: number;
}

function parseTrackNumber(value: string): TrackNumber {
  const match = trackNumberRegex.exec(value);
  if (!match) {
    throw new Error("Invalid track number format, expected <track>/<total>");
  }

  const [, track, total] = match;
  return {
    track: Number(track),
    total: Number(total),
  };
}

/**
 * Tags are Vorbis comments, which are key-value pairs.
 *
 * @see https://xiph.org/vorbis/doc/v-comment.html
 */

const IntermediateMetaflacSchema = z.object({
  TITLE: z.tuple([z.string()]).describe("Track/Work name"),
  VERSION: z
    .tuple([z.string()])
    .optional()
    .describe(
      "The version field may be used to differentiate multiple versions of the same track title in a single collection. (e.g. remix info)",
    ),
  ALBUM: z
    .tuple([z.string()])
    .describe("The collection name to which this track belongs"),
  TRACKNUMBER: z
    .tuple([
      z
        .string()
        .regex(
          trackNumberRegex,
          "Invalid track number format, expected <track>/<total>",
        ),
    ])
    .describe(
      "The track number of this piece if part of a specific larger collection or album",
    ), // todo handle number parsing
  ARTIST: z
    .array(z.string())
    .describe(
      "The artist generally considered responsible for the work. In popular music this is usually the performing band or singer. For classical music it would be the composer. For an audio book it would be the author of the original text.",
    ),
  PERFORMER: z
    .array(z.string())
    .optional()
    .describe(
      "The artist(s) who performed the work. In classical music this would be the conductor, orchestra, soloists. In an audio book it would be the actor who did the reading. In popular music this is typically the same as the ARTIST and is omitted.",
    ),
  COPYRIGHT: z
    .tuple([z.string()])
    .optional()
    .describe(
      "Copyright attribution, e.g., '2001 Nobody's Band' or '1999 Jack Moffitt'",
    ),
  LICENSE: z
    .tuple([z.string()])
    .optional()
    .describe(
      "License information, for example, 'All Rights Reserved', 'Any Use Permitted', a URL to a license such as a Creative Commons license (e.g. \"creativecommons.org/licenses/by/4.0/\"), or similar.",
    ),
  ORGANIZATION: z
    .array(z.string())
    .optional()
    .describe(
      "Name of the organization producing the track (i.e. the 'record label')",
    ),
  DESCRIPTION: z
    .tuple([z.string()])
    .optional()
    .describe("A short text description of the contents"),
  GENRE: z
    .array(z.string())
    .optional()
    .describe("A short text indication of music genre"),
  DATE: z
    .tuple([z.string()])
    .optional()
    .describe("Date the track was recorded"),
  LOCATION: z
    .tuple([z.string()])
    .optional()
    .describe("Location where track was recorded"),
  CONTACT: z
    .tuple([z.string()])
    .optional()
    .describe(
      "Contact information for the creators or distributors of the track. This could be a URL, an email address, the physical address of the producing label.",
    ),
  ISRC: z
    .tuple([z.string().regex(isrcRegex, "Invalid ISRC format")])
    .optional()
    .describe("ISRC number for the track; see https://isrc.ifpi.org"),
});

export const MetaflacSchema = IntermediateMetaflacSchema.transform((val) => ({
  TITLE: val.TITLE[0],
  ARTIST: val.ARTIST,
  ALBUM: val.ALBUM[0],
  TRACKNUMBER: parseTrackNumber(val.TRACKNUMBER[0]),
  VERSION: val.VERSION?.[0],
  PERFORMER: val.PERFORMER,
  COPYRIGHT: val.COPYRIGHT?.[0],
  LICENSE: val.LICENSE?.[0],
  ORGANIZATION: val.ORGANIZATION ?? undefined,
  DESCRIPTION: val.DESCRIPTION?.[0],
  GENRE: val.GENRE ?? undefined,
  DATE: val.DATE?.[0],
  LOCATION: val.LOCATION?.[0],
  CONTACT: val.CONTACT?.[0],
  ISRC: val.ISRC?.[0],
}));

export type MetaflacTags = z.output<typeof MetaflacSchema>;

export type MetaflacSupportedTag = keyof MetaflacTags;

export function parseMetaflacTags(data: string): MetaflacTags {
  const parsedLines = parseOutput(data);
  return Object.fromEntries(
    Object.entries(MetaflacSchema.parse(parsedLines)).filter(
      ([, v]) => v !== undefined,
    ),
  ) as MetaflacTags;
}
