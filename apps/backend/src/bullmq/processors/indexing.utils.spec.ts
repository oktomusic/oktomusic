import { Temporal } from "temporal-polyfill";
import { describe, expect, it } from "vitest";

import {
  getAlbumSignature,
  getOrderedTrackKeys,
  getTrackCountsPerDisc,
  pickAlbumDateFromTrackDates,
  validateAlbumFilesMetadata,
} from "./indexing.utils";

describe("indexing.utils", () => {
  describe("validateAlbumFilesMetadata", () => {
    const file = (
      overrides: Partial<{
        ALBUM: string;
        ALBUMARTIST: string[];
        DISCNUMBER: number;
        TRACKNUMBER: number;
        TOTALTRACKS: number;
        TOTALDISCS: number;
      }> = {},
    ) => ({
      tags: {
        ALBUM: "Album",
        ALBUMARTIST: ["Artist"],
        DISCNUMBER: 1,
        TRACKNUMBER: 1,
        TOTALTRACKS: 1,
        TOTALDISCS: 1,
        ...overrides,
      },
    });

    it("accepts a complete album folder", () => {
      const issues = validateAlbumFilesMetadata([
        file({ TRACKNUMBER: 1, TOTALTRACKS: 2, TOTALDISCS: 2 }),
        file({ TRACKNUMBER: 2, TOTALTRACKS: 2, TOTALDISCS: 2 }),
        file({
          DISCNUMBER: 2,
          TRACKNUMBER: 1,
          TOTALTRACKS: 1,
          TOTALDISCS: 2,
        }),
      ]);

      expect(issues).toEqual([]);
    });

    it("rejects inconsistent album identity metadata", () => {
      const issues = validateAlbumFilesMetadata([
        file(),
        file({ ALBUM: "Other Album", ALBUMARTIST: ["Other Artist"] }),
      ]);

      expect(issues).toContain("Inconsistent ALBUM values: Album, Other Album");
      expect(issues).toContain(
        'Inconsistent ALBUMARTIST values: ["Artist"], ["Other Artist"]',
      );
    });

    it("rejects inconsistent disc totals", () => {
      const issues = validateAlbumFilesMetadata([
        file({ TRACKNUMBER: 1, TOTALTRACKS: 2, TOTALDISCS: 2 }),
        file({ TRACKNUMBER: 2, TOTALTRACKS: 2, TOTALDISCS: 3 }),
      ]);

      expect(issues).toContain("Inconsistent TOTALDISCS values: 2, 3");
    });

    it("rejects a total disc count that does not match the highest disc number", () => {
      const issues = validateAlbumFilesMetadata([
        file({ TRACKNUMBER: 1, TOTALTRACKS: 1, TOTALDISCS: 3 }),
        file({
          DISCNUMBER: 2,
          TRACKNUMBER: 1,
          TOTALTRACKS: 1,
          TOTALDISCS: 3,
        }),
      ]);

      expect(issues).toContain(
        "TOTALDISCS (3) does not match the highest DISCNUMBER (2)",
      );
    });

    it("rejects inconsistent track totals within the same disc", () => {
      const issues = validateAlbumFilesMetadata([
        file({ TRACKNUMBER: 1, TOTALTRACKS: 2 }),
        file({ TRACKNUMBER: 2, TOTALTRACKS: 3 }),
      ]);

      expect(issues).toContain(
        "Inconsistent TOTALTRACKS values for DISCNUMBER 1: 2, 3",
      );
    });

    it("rejects duplicate disc and track positions", () => {
      const issues = validateAlbumFilesMetadata([
        file({ TRACKNUMBER: 1, TOTALTRACKS: 2 }),
        file({ TRACKNUMBER: 1, TOTALTRACKS: 2 }),
      ]);

      expect(issues).toContain(
        "Duplicate DISCNUMBER + TRACKNUMBER pairs: d1t1",
      );
      expect(issues).toContain(
        "DISCNUMBER 1 declares TOTALTRACKS=2 but has 1 unique track number(s)",
      );
      expect(issues).toContain("DISCNUMBER 1 is missing TRACKNUMBER values: 2");
    });

    it("rejects missing and out-of-range track positions", () => {
      const issues = validateAlbumFilesMetadata([
        file({ TRACKNUMBER: 1, TOTALTRACKS: 2 }),
        file({ TRACKNUMBER: 3, TOTALTRACKS: 2 }),
      ]);

      expect(issues).toContain("DISCNUMBER 1 is missing TRACKNUMBER values: 2");
      expect(issues).toContain(
        "DISCNUMBER 1 has TRACKNUMBER values outside 1..2: 3",
      );
    });
  });

  describe("getTrackCountsPerDisc", () => {
    it("returns empty for no tracks", () => {
      expect(getTrackCountsPerDisc([])).toEqual([]);
    });

    it("counts tracks per disc and fills missing discs", () => {
      const tracks = [{ discNumber: 1 }, { discNumber: 1 }, { discNumber: 3 }];

      expect(getTrackCountsPerDisc(tracks)).toEqual([2, 0, 1]);
    });
  });

  describe("getOrderedTrackKeys", () => {
    it("orders by discNumber then trackNumber", () => {
      const keys = getOrderedTrackKeys([
        { discNumber: 2, trackNumber: 1, title: "B", isrc: null },
        { discNumber: 1, trackNumber: 2, title: "A2", isrc: null },
        { discNumber: 1, trackNumber: 1, title: "A1", isrc: null },
      ]);

      expect(keys).toEqual(["d1t1:title:A1", "d1t2:title:A2", "d2t1:title:B"]);
    });

    it("prefers ISRC when present and uppercases it", () => {
      const keys = getOrderedTrackKeys([
        {
          discNumber: 1,
          trackNumber: 1,
          title: "Some Track",
          isrc: "fr-abc-12-34567",
        },
      ]);

      expect(keys).toEqual(["d1t1:isrc:FR-ABC-12-34567"]);
    });

    it("falls back to trimmed title when ISRC missing", () => {
      const keys = getOrderedTrackKeys([
        { discNumber: 1, trackNumber: 1, title: "  Hello  ", isrc: null },
      ]);

      expect(keys).toEqual(["d1t1:title:Hello"]);
    });
  });

  describe("getAlbumSignature", () => {
    it("is stable", () => {
      const sig = getAlbumSignature(
        "  Album ",
        ["  Artist 1 ", "Artist 2"],
        [10],
        ["d1t1:isrc:XX-YYY-12-34567"],
      );

      expect(sig).toBe(
        JSON.stringify({
          album: "  Album ",
          artists: ["  Artist 1 ", "Artist 2"],
          trackCounts: [10],
          trackKeys: ["d1t1:isrc:XX-YYY-12-34567"],
        }),
      );
    });
  });

  describe("pickAlbumDateFromTrackDates", () => {
    const d = (isoDate: string) => Temporal.PlainDate.from(isoDate);

    it("picks the (only) majority date", () => {
      const result = pickAlbumDateFromTrackDates([
        d("2020-01-01"),
        d("2020-01-01"),
        d("2020-01-01"),
        d("2021-01-01"),
        null,
      ]);

      expect(result?.toString()).toBe("2020-01-01");
    });

    it("picks the earliest date that appears more than once when no majority exists", () => {
      const result = pickAlbumDateFromTrackDates([
        d("2022-01-01"),
        d("2020-01-01"),
        d("2020-01-01"),
        d("2021-01-01"),
      ]);

      expect(result?.toString()).toBe("2020-01-01");
    });

    it("picks the earliest date overall when all dates are unique", () => {
      const result = pickAlbumDateFromTrackDates([
        d("2021-06-01"),
        d("2020-01-01"),
        d("2022-02-02"),
      ]);

      expect(result?.toString()).toBe("2020-01-01");
    });

    it("returns null when no dates are present", () => {
      expect(pickAlbumDateFromTrackDates([null, undefined])).toBeNull();
    });
  });
});
