import z from "zod";

import { zLanguageUnix } from "./language_codes";
import { zMimeTypeAudio, zMimeTypeImage, zMimeTypeVideo } from "./mime_types";

export const OGPTagsSchema = {
  "og:title": z.string(),
  "og:type": z.enum([
    "music.song",
    "music.album",
    "music.playlist",
    "music.radio_station",
    "video.movie",
    "video.episode",
    "video.tv_show",
    "video.other",
    "article",
    "book",
    "profile",
    "website",
  ]),
  "og:url": z.url(),
  "og:description": z.string(),
  "og:determiner": z.enum(["a", "an", "the", "auto", ""]),
  "og:locale": zLanguageUnix,
  "og:locale:alternate": z.array(zLanguageUnix),
  "og:site_name": z.string(),
  "og:image": z.url(),
  "og:image:url": z.url(),
  "og:image:secure_url": z.url(),
  "og:image:type": zMimeTypeImage,
  "og:image:width": z
    .int()
    .positive()
    .transform((val) => val.toString()),
  "og:image:height": z
    .int()
    .positive()
    .transform((val) => val.toString()),
  "og:image:alt": z.string(),
  "og:video": z.url(),
  "og:video:url": z.url(),
  "og:video:secure_url": z.url(),
  "og:video:type": zMimeTypeVideo,
  "og:video:width": z
    .int()
    .positive()
    .transform((val) => val.toString()),
  "og:video:height": z
    .int()
    .positive()
    .transform((val) => val.toString()),
  "og:audio": z.url(),
  "og:audio:url": z.url(),
  "og:audio:secure_url": z.url(),
  "og:audio:type": zMimeTypeAudio,
} as const;

export const DAIUTagsSchema = {
  "daiu:origin": z.enum(["HM", "AG"]),
  "daiu:level": z.enum(["none", "assist", "remix"]),
  "daiu:verification": z.literal("DAIU 1.0"),
  "daiu:description": z.string(),
} as const;

// TODO: X Cards
//
// The documentation appears to be gone from the X Developer site at the moment (?)
export const XCardsTagsSchema = {} as const;

export const MetaTagsSchema = {
  ...OGPTagsSchema,
  ...DAIUTagsSchema,
  ...XCardsTagsSchema,
} as const;

export type MetaTagsInput<T extends Record<string, z.ZodTypeAny>> = Readonly<{
  [K in keyof T]: z.input<T[K]>;
}>;

export type OGPTags = MetaTagsInput<typeof OGPTagsSchema>;

export type DAIUTags = MetaTagsInput<typeof DAIUTagsSchema>;

export type XCardsTags = MetaTagsInput<typeof XCardsTagsSchema>;

export type MetaTags = OGPTags & DAIUTags & XCardsTags;

export type MetaTagsKeys = keyof MetaTags;

export type CompiledMetaTags = readonly {
  readonly property: string;
  readonly content: string;
}[];

export function compileMetaTags(metaTags: Partial<MetaTags>): CompiledMetaTags {
  return Object.entries(metaTags).flatMap(([property, content]) => {
    const schema = MetaTagsSchema[property as MetaTagsKeys];
    const parsed: unknown = schema.parse(content);

    if (Array.isArray(parsed)) {
      return parsed.map((value) => ({
        property,
        content: String(value),
      }));
    }

    return [{ property, content: String(parsed) }];
  });
}
