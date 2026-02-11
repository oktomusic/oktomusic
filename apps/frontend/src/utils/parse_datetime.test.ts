import { describe, expect, it } from "vitest";

import { parseDateTime } from "./parse_datetime";

describe("parseDateTime", () => {
  it("converts ISO 8601 strings to Date objects", () => {
    const isoString = "2026-01-28T13:51:39.564Z";
    const result = parseDateTime(isoString);

    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe(isoString);
  });

  it("handles various ISO date format strings", () => {
    const dateString = "2026-02-11T00:00:00.000Z";
    const result = parseDateTime(dateString);

    expect(result).toBeInstanceOf(Date);
    expect(result?.getUTCFullYear()).toBe(2026);
    expect(result?.getUTCMonth()).toBe(1); // February (0-indexed)
    expect(result?.getUTCDate()).toBe(11);
  });

  it("handles date strings without milliseconds", () => {
    const dateString = "2025-12-31T23:59:59Z";
    const result = parseDateTime(dateString);

    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe("2025-12-31T23:59:59.000Z");
  });

  it("returns Date as-is if already a Date", () => {
    const date = new Date("2026-01-15T10:30:00.000Z");
    const result = parseDateTime(date);

    expect(result).toBe(date);
    expect(result).toBeInstanceOf(Date);
  });

  it("returns null for null input", () => {
    const result = parseDateTime(null);

    expect(result).toBeNull();
  });

  it("returns null for undefined input", () => {
    const result = parseDateTime(undefined);

    expect(result).toBeNull();
  });

  it("returns null for non-string, non-Date values", () => {
    expect(parseDateTime(123)).toBeNull();
    expect(parseDateTime(true)).toBeNull();
    expect(parseDateTime({})).toBeNull();
    expect(parseDateTime([])).toBeNull();
  });

  it("handles invalid date strings by creating Invalid Date", () => {
    const result = parseDateTime("not a valid date");

    expect(result).toBeInstanceOf(Date);
    expect(Number.isNaN(result?.getTime())).toBe(true);
  });

  it("handles empty string by creating Invalid Date", () => {
    const result = parseDateTime("");

    expect(result).toBeInstanceOf(Date);
    expect(Number.isNaN(result?.getTime())).toBe(true);
  });

  it("preserves timezone information in ISO strings", () => {
    const isoWithOffset = "2026-02-11T15:30:00+01:00";
    const result = parseDateTime(isoWithOffset);

    expect(result).toBeInstanceOf(Date);
    // The Date object will normalize to UTC
    expect(result?.toISOString()).toBe("2026-02-11T14:30:00.000Z");
  });

  it("handles date strings at epoch", () => {
    const epochString = "1970-01-01T00:00:00.000Z";
    const result = parseDateTime(epochString);

    expect(result).toBeInstanceOf(Date);
    expect(result?.getTime()).toBe(0);
  });
});
