import { z } from "zod";

/**
 * A link or meta item in JSPF format.
 * Each object has a single key-value pair where the key is the rel URI
 * and the value is the content URI (for link) or text value (for meta).
 */
export const JspfLinkMetaItemSchema = z.record(z.string(), z.string());

/**
 * An attribution item in JSPF format.
 * Each item has either a `location` or `identifier` property.
 */
export const JspfAttributionItemSchema = z.object({
  location: z.string().optional(),
  identifier: z.string().optional(),
});

/**
 * Extension data in JSPF format.
 * The keys are application URIs and the values are arrays of arbitrary data.
 */
export const JspfExtensionSchema = z.record(z.string(), z.array(z.unknown()));

/**
 * A single track in JSPF format.
 */
export const JspfTrackSchema = z.object({
  /**
   * URIs of resources to be rendered. A user-agent MUST NOT render more than one.
   */
  location: z.array(z.string()).optional(),
  /**
   * Canonical IDs for this resource. MUST be legal URIs.
   */
  identifier: z.array(z.string()).optional(),
  /**
   * Human-readable name of the track.
   */
  title: z.string().optional(),
  /**
   * Human-readable name of the entity that authored the resource.
   */
  creator: z.string().optional(),
  /**
   * A human-readable comment on the track. May not contain markup.
   */
  annotation: z.string().optional(),
  /**
   * URI of a web page to find out more about this track.
   */
  info: z.string().optional(),
  /**
   * URI of an image to display for this track.
   */
  image: z.string().optional(),
  /**
   * Human-readable name of the collection from which this track comes.
   */
  album: z.string().optional(),
  /**
   * Integer giving the ordinal position of the media in the album.
   */
  trackNum: z.number().int().nonnegative().optional(),
  /**
   * The time to render a resource, in milliseconds.
   */
  duration: z.number().int().nonnegative().optional(),
  /**
   * Link elements allowing JSPF to be extended.
   */
  link: z.array(JspfLinkMetaItemSchema).optional(),
  /**
   * Meta elements allowing metadata fields to be added.
   */
  meta: z.array(JspfLinkMetaItemSchema).optional(),
  /**
   * Extension data.
   */
  extension: JspfExtensionSchema.optional(),
});

/**
 * The playlist data in JSPF format (the inner `playlist` object).
 */
export const JspfPlaylistDataSchema = z.object({
  /**
   * A human-readable title for the playlist.
   */
  title: z.string().optional(),
  /**
   * Human-readable name of the entity that authored the playlist.
   */
  creator: z.string().optional(),
  /**
   * A human-readable comment on the playlist. May not contain markup.
   */
  annotation: z.string().optional(),
  /**
   * URI of a web page to find out more about this playlist.
   */
  info: z.string().optional(),
  /**
   * Source URI for this playlist.
   */
  location: z.string().optional(),
  /**
   * Canonical ID for this playlist. MUST be a legal URI.
   */
  identifier: z.string().optional(),
  /**
   * URI of an image to display for the playlist.
   */
  image: z.string().optional(),
  /**
   * Creation date of the playlist, formatted as an XML schema dateTime.
   */
  date: z.string().optional(),
  /**
   * URI of a resource that describes the license under which this playlist was released.
   */
  license: z.string().optional(),
  /**
   * Ordered list of URIs for attribution. Used to satisfy licenses allowing
   * modification but requiring attribution.
   */
  attribution: z.array(JspfAttributionItemSchema).optional(),
  /**
   * Link elements allowing JSPF to be extended.
   */
  link: z.array(JspfLinkMetaItemSchema).optional(),
  /**
   * Meta elements allowing metadata fields to be added.
   */
  meta: z.array(JspfLinkMetaItemSchema).optional(),
  /**
   * Extension data.
   */
  extension: JspfExtensionSchema.optional(),
  /**
   * Ordered list of tracks to be rendered.
   */
  track: z.array(JspfTrackSchema).optional(),
});

/**
 * Root JSPF document schema.
 * A JSPF document is a JSON object with a single `playlist` property.
 */
export const JspfSchema = z.object({
  playlist: JspfPlaylistDataSchema,
});

export type JspfLinkMetaItem = z.output<typeof JspfLinkMetaItemSchema>;
export type JspfAttributionItem = z.output<typeof JspfAttributionItemSchema>;
export type JspfExtension = z.output<typeof JspfExtensionSchema>;
export type JspfTrack = z.output<typeof JspfTrackSchema>;
export type JspfPlaylistData = z.output<typeof JspfPlaylistDataSchema>;
export type JspfPlaylist = z.output<typeof JspfSchema>;

/**
 * Parses a JSPF JSON string into a validated playlist object.
 *
 * @param input - The JSPF JSON string to parse.
 * @returns A validated `JspfPlaylist` object.
 * @throws If the input is not valid JSON or does not conform to the JSPF schema.
 */
export function parseJspf(input: string): JspfPlaylist {
  let raw: unknown;
  try {
    raw = JSON.parse(input);
  } catch (err) {
    throw new Error(`Invalid JSPF: failed to parse JSON: ${String(err)}`);
  }
  const result = JspfSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Invalid JSPF: schema validation failed: ${result.error.message}`,
    );
  }
  return result.data;
}

/**
 * Serializes a playlist object to a JSPF JSON string.
 *
 * @param playlist - The playlist to serialize.
 * @param indent - Optional indentation for pretty-printing (default: 2).
 * @returns A JSPF JSON string.
 */
export function generateJspf(playlist: JspfPlaylist, indent = 2): string {
  return JSON.stringify(playlist, null, indent);
}
