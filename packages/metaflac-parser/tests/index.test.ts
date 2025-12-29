import { expect, suite, test } from "vitest";
import { Temporal } from "temporal-polyfill";

import { parseMetaflacTags } from "../src";
import { parseLine, parseOutput, zPlainDate } from "../src/utils";

import test_1 from "./test_1.txt?raw";

void suite("Metaflac output parser", () => {
  test("parseLine", () => {
    const result_1 = parseLine("ALBUM=Phoenix");
    const result_2 = parseLine("INVALID LINE");
    const result_3 = parseLine("comment=Some Value");
    expect(["ALBUM", "Phoenix"]).toStrictEqual(result_1);
    expect(result_2).toBeNull();
    expect(["COMMENT", "Some Value"]).toStrictEqual(result_3);
  });

  test("parseOutput", () => {
    const result = parseOutput(test_1);
    expect(result["COMMENT"]).toBeDefined();
    expect(result["COMMENT"].length).toBe(1);
    expect(result["COMMENT"][0]).toBe("downloaded from unkonwn source");
    expect(result["COMPOSER"]).toBeDefined();
    expect(result["COMPOSER"].length).toBe(2);
    expect(result["COMPOSER"][0]).toBe("Jakob Halvorsen");
    expect(result["COMPOSER"][1]).toBe("Eemil Otto Henrik Helin");
  });

  test("parseMetaflacTags", () => {
    const expected = {
      ALBUM: "Phoenix",
      ISRC: "GB2LD2110224",
      ARTIST: ["Netrum", "HALVORSEN"],
      ALBUMARTIST: ["Netrum", "HALVORSEN"],
      COPYRIGHT: "NCS",
      TITLE: "Phoenix",
      TRACKNUMBER: 1,
      DISCNUMBER: 1,
      TOTALDISCS: 1,
      TOTALTRACKS: 1,
      DATE: Temporal.PlainDate.from("2021-08-20"),
    };
    const result = parseMetaflacTags(test_1);
    expect(result).toStrictEqual(expected);
  });

  test("parseMetaflacTags rejects invalid track numbers", () => {
    const invalidTrackOutput = `TITLE=Track
ALBUM=Album
TRACKNUMBER=5
DISCNUMBER=1
ARTIST=Artist
ARTIST=Artist2
ALBUMARTIST=Artist
ALBUMARTIST=Artist2`;

    expect(() => parseMetaflacTags(invalidTrackOutput)).toThrowError(
      /invalid/i,
    );
  });

  test("zPlainDate parses a strict YYYY-MM-DD", () => {
    const result = zPlainDate.parse("2021-08-20");
    expect(
      Temporal.PlainDate.compare(result, Temporal.PlainDate.from("2021-08-20")),
    ).toBe(0);
  });

  test("zPlainDate rejects non-YYYY-MM-DD formats", () => {
    const result = zPlainDate.safeParse("20210820");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Invalid date format (YYYY-MM-DD)",
      );
    }
  });

  test("zPlainDate rejects invalid calendar dates", () => {
    const result = zPlainDate.safeParse("2021-02-30");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Invalid calendar date",
      );
    }
  });
});
