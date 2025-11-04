import { Injectable } from "@nestjs/common";

// OpenGraph Protocol
//
// https://ogp.me

type OpenGraphType =
  | "music.song"
  | "music.album"
  | "music.playlist"
  | "music.radio_station"
  | "video.movie"
  | "video.episode"
  | "video.tv_show"
  | "video.other"
  | "article"
  | "book"
  | "payment.link"
  | "profile"
  | "website";

type OpenGraphValueMap = {
  "og:title": string;
  "og:type": OpenGraphType;
  "og:image": string;
  "og:url": string;
  "og:audio": string;
  "og:description": string;
  "og:determiner": string;
  "og:locale": string;
  "og:locale:alternate": string;
  "og:site_name": string;
  "og:video": string;
  "og:image:url": string;
  "og:image:secure_url": string;
  "og:image:type": string;
  "og:image:width": string;
  "og:image:height": string;
  "og:image:alt": string;
};

// X/Twitter Cards
//
// https://developer.x.com/en/docs/x-for-websites/cards/guides/getting-started
// https://developer.x.com/en/docs/x-for-websites/cards/overview/markup

type XCard = "summary" | "summary_large_image" | "app" | "player";

type XValueMap = {
  "twitter:card": XCard;
  "twitter:site": string;
  "twitter:site:id": string;
  "twitter:creator": string;
  "twitter:creator:id": string;
  "twitter:title": string;
  "twitter:description": string;
  "twitter:image": string;
  "twitter:image:alt": string;
  "twitter:player": string;
  "twitter:player:width": string;
  "twitter:player:height": string;
  "twitter:player:stream": string;
  "twitter:app:name:iphone": string;
  "twitter:app:id:iphone": string;
  "twitter:app:url:iphone": string;
  "twitter:app:name:ipad": string;
  "twitter:app:id:ipad": string;
  "twitter:app:url:ipad": string;
  "twitter:app:name:googleplay": string;
  "twitter:app:id:googleplay": string;
  "twitter:app:url:googleplay": string;
};

type KnownMetaValueMap = OpenGraphValueMap & XValueMap;

type PairsFromMap<T extends Record<string, string>> = {
  [K in keyof T]: { property: K; content: T[K] };
}[keyof T];

export type MetaTag = PairsFromMap<KnownMetaValueMap>;

export type MetaTags = MetaTag[];

@Injectable()
export class OpenGraphService {
  getDefaultTags(): MetaTags {
    const tags: MetaTags = [
      { property: "og:title", content: "Oktomusic" },
      { property: "og:site_name", content: "Oktomusic" },
      {
        property: "og:description",
        content: "Self-hostable music streaming server",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
    ];

    // if (url) tags.push({ property: "og:url", content: url })
    // if (imageUrl) tags.push({ property: "og:image", content: imageUrl })
    // if (imageAlt) tags.push({ property: "og:image:alt", content: "alt" })

    return tags;
  }
}
