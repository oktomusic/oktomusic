import { Injectable } from "@nestjs/common";

export type OpenGraphMetaTag = { property: string; content: string };

@Injectable()
export class OpenGraphService {
  getDefaultTags(): OpenGraphMetaTag[] {
    const tags: OpenGraphMetaTag[] = [
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
