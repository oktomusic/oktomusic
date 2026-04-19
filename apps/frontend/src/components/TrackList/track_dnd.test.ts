import { describe, expect, it } from "vitest";

import { isTrackDragData, TRACK_DND_TYPE } from "./track_dnd";

describe("isTrackDragData", () => {
  it("returns true for a valid TrackDragData payload", () => {
    const data = {
      type: TRACK_DND_TYPE,
      trackId: "track-1",
      trackName: "Song Name",
      playlistId: "playlist-1",
      playlistTrackIndex: 4,
    } as const;

    expect(isTrackDragData(data)).toBe(true);
  });

  it("returns false for non-object values", () => {
    expect(isTrackDragData(null)).toBe(false);
    expect(isTrackDragData(undefined)).toBe(false);
    expect(isTrackDragData("track")).toBe(false);
    expect(isTrackDragData(42)).toBe(false);
    expect(isTrackDragData(true)).toBe(false);
  });

  it("returns false when required fields are missing", () => {
    expect(isTrackDragData({ type: TRACK_DND_TYPE, trackId: "track-1" })).toBe(
      false,
    );
    expect(
      isTrackDragData({ type: TRACK_DND_TYPE, trackName: "Song Name" }),
    ).toBe(false);
    expect(
      isTrackDragData({ trackId: "track-1", trackName: "Song Name" }),
    ).toBe(false);
  });

  it("returns false when required field types are invalid", () => {
    expect(
      isTrackDragData({
        type: TRACK_DND_TYPE,
        trackId: 123,
        trackName: "Song Name",
      }),
    ).toBe(false);

    expect(
      isTrackDragData({
        type: TRACK_DND_TYPE,
        trackId: "track-1",
        trackName: 123,
      }),
    ).toBe(false);
  });

  it("returns false when type is not track", () => {
    expect(
      isTrackDragData({
        type: "not-track",
        trackId: "track-1",
        trackName: "Song Name",
      }),
    ).toBe(false);
  });
});
