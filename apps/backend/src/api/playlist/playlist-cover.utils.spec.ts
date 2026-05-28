import { describe, expect, it } from "vitest";

import { getCoverAlbumIds } from "./playlist-cover.utils";

describe("playlist-cover.utils", () => {
  describe("getCoverAlbumIds", () => {
    it("returns empty when no album ids are provided", () => {
      expect(getCoverAlbumIds([])).toEqual([]);
    });

    it("ignores null and undefined values", () => {
      expect(getCoverAlbumIds([null, undefined])).toEqual([]);
    });

    it("returns the first unique album id when fewer than four are available", () => {
      expect(getCoverAlbumIds(["album-1", "album-2"])).toEqual(["album-1"]);
    });

    it("deduplicates album ids while preserving order", () => {
      expect(
        getCoverAlbumIds(["album-1", "album-1", "album-2", "album-1"]),
      ).toEqual(["album-1"]);
    });

    it("returns the first four unique album ids", () => {
      expect(
        getCoverAlbumIds([
          "album-1",
          "album-2",
          "album-3",
          "album-4",
          "album-5",
        ]),
      ).toEqual(["album-1", "album-2", "album-3", "album-4"]);
    });
  });
});
