import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { suite, test, expect } from "vitest";
import { parseTTMLtoLyrics } from ".";
import { LyricsSchema } from "./model";

void suite("Lyrics parser", () => {
  void test("schema: parsed TTML matches LyricsSchema", () => {
    const file = resolve(__dirname, "./test/test.ttml");
    const xml = readFileSync(file, "utf8");
    const parsed = parseTTMLtoLyrics(xml);
    const result = LyricsSchema.safeParse(parsed);
    expect(result.success).toBe(true);
  });
});
