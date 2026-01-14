import { describe, expect, it } from "vitest";

import { formatDuration } from "./format_duration";

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
