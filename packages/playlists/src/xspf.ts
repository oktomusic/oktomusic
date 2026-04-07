import { XMLParser } from "fast-xml-parser";

import type {
  JspfAttributionItem,
  JspfLinkMetaItem,
  JspfPlaylist,
  JspfTrack,
} from "./jspf";
import { JspfSchema } from "./jspf";

// ---------------------------------------------------------------------------
// Internal raw types from fast-xml-parser
// ---------------------------------------------------------------------------

interface RawLinkMetaItem {
  readonly "@_rel": string;
  readonly "#text"?: string;
}

interface RawAttribution {
  readonly location?: string | readonly string[];
  readonly identifier?: string | readonly string[];
}

interface RawTrack {
  readonly location?: string | readonly string[];
  readonly identifier?: string | readonly string[];
  readonly title?: string;
  readonly creator?: string;
  readonly annotation?: string;
  readonly info?: string;
  readonly image?: string;
  readonly album?: string;
  readonly trackNum?: number | string;
  readonly duration?: number | string;
  readonly link?: RawLinkMetaItem | readonly RawLinkMetaItem[];
  readonly meta?: RawLinkMetaItem | readonly RawLinkMetaItem[];
}

interface RawPlaylist {
  readonly title?: string;
  readonly creator?: string;
  readonly annotation?: string;
  readonly info?: string;
  readonly location?: string;
  readonly identifier?: string;
  readonly image?: string;
  readonly date?: string;
  readonly license?: string;
  readonly attribution?: RawAttribution;
  readonly link?: RawLinkMetaItem | readonly RawLinkMetaItem[];
  readonly meta?: RawLinkMetaItem | readonly RawLinkMetaItem[];
  readonly trackList?: {
    readonly track?: RawTrack | readonly RawTrack[];
  };
}

// ---------------------------------------------------------------------------
// XML Parser
// ---------------------------------------------------------------------------

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  ignoreDeclaration: true,
  trimValues: true,
  parseTagValue: false,
  parseAttributeValue: false,
  isArray: (tagName, jPathOrMatcher) => {
    const jPath =
      typeof jPathOrMatcher === "string"
        ? jPathOrMatcher
        : jPathOrMatcher.toString();
    if (tagName === "track") return true;
    // location and identifier can be multiple inside a track
    if (tagName === "location" && jPath.includes("trackList")) return true;
    if (tagName === "identifier" && jPath.includes("trackList")) return true;
    if (tagName === "link") return true;
    if (tagName === "meta") return true;
    return false;
  },
});

// ---------------------------------------------------------------------------
// Conversion helpers
// ---------------------------------------------------------------------------

function toStringArray(
  value: string | readonly string[] | undefined,
): readonly string[] {
  if (!value) return [];
  return Array.isArray(value)
    ? (value as readonly string[])
    : [value as string];
}

function rawLinkMetaToJspf(
  items: RawLinkMetaItem | readonly RawLinkMetaItem[] | undefined,
): readonly JspfLinkMetaItem[] | undefined {
  if (!items) return undefined;
  const arr = Array.isArray(items) ? items : [items];
  const result: JspfLinkMetaItem[] = (arr as readonly RawLinkMetaItem[]).map(
    (item) => ({
      [item["@_rel"]]: item["#text"] ?? "",
    }),
  );
  return result.length > 0 ? result : undefined;
}

function rawAttributionToJspf(
  raw: RawAttribution | undefined,
): readonly JspfAttributionItem[] | undefined {
  if (!raw) return undefined;
  const items: JspfAttributionItem[] = [];
  // Iterate keys in insertion order to preserve the order of attribution elements in the XML
  for (const [key, value] of Object.entries(raw)) {
    if (key === "location") {
      for (const loc of toStringArray(value as string | readonly string[])) {
        items.push({ location: loc });
      }
    } else if (key === "identifier") {
      for (const id of toStringArray(value as string | readonly string[])) {
        items.push({ identifier: id });
      }
    }
  }
  return items.length > 0 ? items : undefined;
}

function rawTrackToJspf(raw: RawTrack): JspfTrack {
  const locations = toStringArray(raw.location);
  const identifiers = toStringArray(raw.identifier);
  const track: JspfTrack = {};
  if (locations.length > 0) track.location = [...locations];
  if (identifiers.length > 0) track.identifier = [...identifiers];
  if (raw.title != null) track.title = String(raw.title);
  if (raw.creator != null) track.creator = String(raw.creator);
  if (raw.annotation != null) track.annotation = String(raw.annotation);
  if (raw.info != null) track.info = String(raw.info);
  if (raw.image != null) track.image = String(raw.image);
  if (raw.album != null) track.album = String(raw.album);
  if (raw.trackNum != null) {
    const n =
      typeof raw.trackNum === "string"
        ? parseInt(raw.trackNum, 10)
        : raw.trackNum;
    if (!isNaN(n)) track.trackNum = n;
  }
  if (raw.duration != null) {
    const d =
      typeof raw.duration === "string"
        ? parseInt(raw.duration, 10)
        : raw.duration;
    if (!isNaN(d)) track.duration = d;
  }
  const link = rawLinkMetaToJspf(raw.link);
  if (link) track.link = [...link];
  const meta = rawLinkMetaToJspf(raw.meta);
  if (meta) track.meta = [...meta];
  return track;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parses an XSPF XML string into a validated JSPF playlist object.
 *
 * @param input - The XSPF XML string to parse.
 * @returns A validated `JspfPlaylist` object.
 * @throws If the input is not valid XSPF or does not conform to the JSPF schema.
 */
export function parseXspf(input: string): JspfPlaylist {
  const doc = parser.parse(input) as Record<string, unknown>;

  const rawPlaylist = doc["playlist"] as RawPlaylist | undefined;
  if (!rawPlaylist || typeof rawPlaylist !== "object") {
    throw new Error("Invalid XSPF: missing <playlist> root element");
  }

  const rawTracks = rawPlaylist.trackList?.track;
  const tracksArr: readonly RawTrack[] = rawTracks
    ? Array.isArray(rawTracks)
      ? (rawTracks as readonly RawTrack[])
      : [rawTracks as RawTrack]
    : [];

  const playlistData: Record<string, unknown> = {};

  if (rawPlaylist.title != null) playlistData.title = String(rawPlaylist.title);
  if (rawPlaylist.creator != null)
    playlistData.creator = String(rawPlaylist.creator);
  if (rawPlaylist.annotation != null)
    playlistData.annotation = String(rawPlaylist.annotation);
  if (rawPlaylist.info != null) playlistData.info = String(rawPlaylist.info);
  if (rawPlaylist.location != null)
    playlistData.location = String(rawPlaylist.location);
  if (rawPlaylist.identifier != null)
    playlistData.identifier = String(rawPlaylist.identifier);
  if (rawPlaylist.image != null) playlistData.image = String(rawPlaylist.image);
  if (rawPlaylist.date != null) playlistData.date = String(rawPlaylist.date);
  if (rawPlaylist.license != null)
    playlistData.license = String(rawPlaylist.license);

  const attribution = rawAttributionToJspf(rawPlaylist.attribution);
  if (attribution) playlistData.attribution = attribution;

  const link = rawLinkMetaToJspf(rawPlaylist.link);
  if (link) playlistData.link = link;

  const meta = rawLinkMetaToJspf(rawPlaylist.meta);
  if (meta) playlistData.meta = meta;

  if (tracksArr.length > 0) {
    playlistData.track = tracksArr.map(rawTrackToJspf);
  }

  const result = JspfSchema.safeParse({ playlist: playlistData });
  if (!result.success) {
    throw new Error(
      `Invalid XSPF: schema validation failed: ${result.error.message}`,
    );
  }
  return result.data;
}

// ---------------------------------------------------------------------------
// XML Generation helpers
// ---------------------------------------------------------------------------

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function xmlTag(tag: string, content: string, indent = ""): string {
  return `${indent}<${tag}>${escapeXml(content)}</${tag}>`;
}

function xmlTagAttr(
  tag: string,
  attrs: Record<string, string>,
  content: string,
  indent = "",
): string {
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${escapeXml(v)}"`)
    .join("");
  return `${indent}<${tag}${attrStr}>${escapeXml(content)}</${tag}>`;
}

function buildTrackXml(track: JspfTrack): string {
  const lines: string[] = ["    <track>"];
  for (const loc of track.location ?? []) {
    lines.push(xmlTag("location", loc, "      "));
  }
  for (const id of track.identifier ?? []) {
    lines.push(xmlTag("identifier", id, "      "));
  }
  if (track.title != null) lines.push(xmlTag("title", track.title, "      "));
  if (track.creator != null)
    lines.push(xmlTag("creator", track.creator, "      "));
  if (track.annotation != null)
    lines.push(xmlTag("annotation", track.annotation, "      "));
  if (track.info != null) lines.push(xmlTag("info", track.info, "      "));
  if (track.image != null) lines.push(xmlTag("image", track.image, "      "));
  if (track.album != null) lines.push(xmlTag("album", track.album, "      "));
  if (track.trackNum != null)
    lines.push(xmlTag("trackNum", String(track.trackNum), "      "));
  if (track.duration != null)
    lines.push(xmlTag("duration", String(track.duration), "      "));
  for (const linkItem of track.link ?? []) {
    for (const [rel, content] of Object.entries(linkItem)) {
      lines.push(xmlTagAttr("link", { rel }, content, "      "));
    }
  }
  for (const metaItem of track.meta ?? []) {
    for (const [rel, content] of Object.entries(metaItem)) {
      lines.push(xmlTagAttr("meta", { rel }, content, "      "));
    }
  }
  lines.push("    </track>");
  return lines.join("\n");
}

/**
 * Serializes a playlist object to an XSPF XML string.
 *
 * @param playlist - The playlist to serialize.
 * @returns An XSPF XML string.
 */
export function generateXspf(playlist: JspfPlaylist): string {
  const p = playlist.playlist;
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<playlist version="1" xmlns="http://xspf.org/ns/0/">',
  ];

  if (p.title != null) lines.push(xmlTag("title", p.title, "  "));
  if (p.creator != null) lines.push(xmlTag("creator", p.creator, "  "));
  if (p.annotation != null)
    lines.push(xmlTag("annotation", p.annotation, "  "));
  if (p.info != null) lines.push(xmlTag("info", p.info, "  "));
  if (p.location != null) lines.push(xmlTag("location", p.location, "  "));
  if (p.identifier != null)
    lines.push(xmlTag("identifier", p.identifier, "  "));
  if (p.image != null) lines.push(xmlTag("image", p.image, "  "));
  if (p.date != null) lines.push(xmlTag("date", p.date, "  "));
  if (p.license != null) lines.push(xmlTag("license", p.license, "  "));

  if (p.attribution && p.attribution.length > 0) {
    lines.push("  <attribution>");
    for (const item of p.attribution) {
      if (item.location != null)
        lines.push(xmlTag("location", item.location, "    "));
      if (item.identifier != null)
        lines.push(xmlTag("identifier", item.identifier, "    "));
    }
    lines.push("  </attribution>");
  }

  for (const linkItem of p.link ?? []) {
    for (const [rel, content] of Object.entries(linkItem)) {
      lines.push(xmlTagAttr("link", { rel }, content, "  "));
    }
  }

  for (const metaItem of p.meta ?? []) {
    for (const [rel, content] of Object.entries(metaItem)) {
      lines.push(xmlTagAttr("meta", { rel }, content, "  "));
    }
  }

  lines.push("  <trackList>");
  for (const track of p.track ?? []) {
    lines.push(buildTrackXml(track));
  }
  lines.push("  </trackList>");

  lines.push("</playlist>");
  return lines.join("\n");
}
