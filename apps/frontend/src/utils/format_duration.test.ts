import { describe, expect, it } from "vitest";

import { formatDuration, getDurationComponents } from "./format_duration";

describe("getDurationComponents", () => {
  it("returns only seconds for durations under 60 seconds", () => {
    expect(getDurationComponents(0)).toEqual({ seconds: 0 });
    expect(getDurationComponents(1_000)).toEqual({ seconds: 1 });
    expect(getDurationComponents(5_000)).toEqual({ seconds: 5 });
    expect(getDurationComponents(45_000)).toEqual({ seconds: 45 });
    expect(getDurationComponents(59_000)).toEqual({ seconds: 59 });
  });

  it("returns minutes and seconds for durations under 1 hour", () => {
    expect(getDurationComponents(60_000)).toEqual({ minutes: 1, seconds: 0 });
    expect(getDurationComponents(61_000)).toEqual({ minutes: 1, seconds: 1 });
    expect(getDurationComponents(125_000)).toEqual({ minutes: 2, seconds: 5 });
    expect(getDurationComponents(3_599_000)).toEqual({
      minutes: 59,
      seconds: 59,
    });
  });

  it("returns hours, minutes and seconds for durations 1 hour or more", () => {
    expect(getDurationComponents(3_600_000)).toEqual({
      hours: 1,
      minutes: 0,
      seconds: 0,
    });
    expect(getDurationComponents(3_661_000)).toEqual({
      hours: 1,
      minutes: 1,
      seconds: 1,
    });
    expect(getDurationComponents(3_723_000)).toEqual({
      hours: 1,
      minutes: 2,
      seconds: 3,
    });
    expect(
      getDurationComponents(10 * 3_600_000 + 5 * 60_000 + 7 * 1_000),
    ).toEqual({
      hours: 10,
      minutes: 5,
      seconds: 7,
    });
  });

  it("floors milliseconds to whole seconds", () => {
    expect(getDurationComponents(1_999)).toEqual({ seconds: 1 });
    expect(getDurationComponents(60_001)).toEqual({ minutes: 1, seconds: 0 });
    expect(getDurationComponents(3_661_999)).toEqual({
      hours: 1,
      minutes: 1,
      seconds: 1,
    });
  });
});

describe("formatDuration", () => {
  it("formats seconds and minutes without hours", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(1)).toBe("0:00");
    expect(formatDuration(999)).toBe("0:00");
    expect(formatDuration(1_000)).toBe("0:01");
    expect(formatDuration(5_000)).toBe("0:05");
    expect(formatDuration(59_000)).toBe("0:59");
    expect(formatDuration(60_000)).toBe("1:00");
    expect(formatDuration(61_000)).toBe("1:01");
    expect(formatDuration(3_599_000)).toBe("59:59");
  });

  it("formats hours with two-digit minutes and seconds", () => {
    expect(formatDuration(3_600_000)).toBe("1:00:00");
    expect(formatDuration(3_661_000)).toBe("1:01:01");
    expect(formatDuration(3_723_000)).toBe("1:02:03");
    expect(formatDuration(10 * 3_600_000 + 5 * 60_000 + 7 * 1_000)).toBe(
      "10:05:07",
    );
  });

  it("floors milliseconds to whole seconds", () => {
    expect(formatDuration(1999)).toBe("0:01");
    expect(formatDuration(60000 + 1)).toBe("1:00");
  });
});
