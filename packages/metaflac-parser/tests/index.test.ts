import { expect, suite, test } from "vitest";

import { parseMetaflacTags } from "../src";
import { parseLine, parseOutput } from "../src/utils";

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
      DATE: "2021-08-20",
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
});
