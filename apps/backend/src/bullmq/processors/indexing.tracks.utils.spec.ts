import { describe, expect, it } from "vitest";

import {
  getAlbumDiscTrackKey,
  getPreferredTrackIdentity,
  getTrackUpdatePlan,
  normalizeIsrc,
  normalizeTitle,
} from "./indexing.tracks.utils";

describe("indexing.tracks.utils", () => {
  it("normalizeIsrc trims/uppercases and returns undefined for empty", () => {
    expect(normalizeIsrc(undefined)).toBeUndefined();
    expect(normalizeIsrc(null)).toBeUndefined();
    expect(normalizeIsrc("   ")).toBeUndefined();
    expect(normalizeIsrc(" fr-abc-12-34567 ")).toBe("FR-ABC-12-34567");
  });

  it("normalizeTitle trims and returns undefined for empty", () => {
    expect(normalizeTitle(undefined)).toBeUndefined();
    expect(normalizeTitle(null)).toBeUndefined();
    expect(normalizeTitle("   ")).toBeUndefined();
    expect(normalizeTitle("  I'm Good (Blue)  ")).toBe("I'm Good (Blue)");
  });

  it("getPreferredTrackIdentity prefers ISRC over title", () => {
    expect(
      getPreferredTrackIdentity({
        isrc: "fr-abc-12-34567",
        title: "X",
      }),
    ).toBe("isrc:FR-ABC-12-34567");

    expect(
      getPreferredTrackIdentity({
        isrc: null,
        title: "Song",
      }),
    ).toBe("title:Song");
  });

  it("getAlbumDiscTrackKey is stable", () => {
    expect(getAlbumDiscTrackKey("a", 1, 2)).toBe("a::d1::t2");
  });

  it("getTrackUpdatePlan updates duration; sets ISRC if missing; updates name only if ISRC present", () => {
    const plan1 = getTrackUpdatePlan(
      { name: "A", isrc: null, durationMs: 1000 },
      { title: "B", isrc: null, durationMs: 2000 },
    );
    expect(plan1.patch).toEqual({ durationMs: 2000 });
    expect(plan1.hasIsrcConflict).toBe(false);

    const plan2 = getTrackUpdatePlan(
      { name: "Old", isrc: null, durationMs: 1000 },
      { title: "New", isrc: "FR-ABC-12-34567", durationMs: 1000 },
    );
    expect(plan2.patch).toEqual({ isrc: "FR-ABC-12-34567", name: "New" });
    expect(plan2.hasIsrcConflict).toBe(false);

    const plan3 = getTrackUpdatePlan(
      { name: "Old", isrc: "FR-ABC-12-34567", durationMs: 1000 },
      { title: "New", isrc: "US-XYZ-98-76543", durationMs: 1000 },
    );
    expect(plan3.patch.isrc).toBeUndefined();
    expect(plan3.hasIsrcConflict).toBe(true);
  });
});
