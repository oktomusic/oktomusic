// https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields#typed-json-fields

import { Lyrics } from "@oktomusic/lyrics";

declare global {
  namespace PrismaJson {
    type LyricsJSON = Lyrics;
  }
}

export {};
