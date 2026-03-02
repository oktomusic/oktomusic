import { Injectable } from "@nestjs/common";

import { CompiledMetaTags, compileMetaTags } from "@oktomusic/meta-tags";

@Injectable()
export class MetaTagsService {
  public readonly defaultTags = compileMetaTags({
    "og:title": "Oktomusic",
    "og:site_name": "Oktomusic",
    "og:description": "Self-hostable music streaming server",
    "og:type": "website",
    "og:locale": "en_US",
    "og:locale:alternate": ["en_US", "fr_FR"],
    "daiu:origin": "HM",
    "daiu:level": "assist",
    "daiu:verification": "DAIU 1.0",
    "daiu:description":
      "LLMs have been used for planned edits, boilerplate generation, prototypes and other tasks to assist in the creation of this application. All code have been reviewed and tested by human developers.",
  });
  public getDefaultTags(): CompiledMetaTags {
    return this.defaultTags;
  }
}
