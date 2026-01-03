import { expect, suite, test } from "vitest";
import { Temporal } from "temporal-polyfill";

import {
  dateToPlainDate,
  parsePlainDateStringToUtcDate,
  plainDateToDate,
  PLAIN_DATE_STRING_REGEX,
} from "./date";

void suite("plainDateToDate", () => {
  test("converts a plain date to a UTC midnight Date", () => {
    const date = Temporal.PlainDate.from("2021-08-20");
    const result = plainDateToDate(date);

    expect(result).toBeInstanceOf(Date);
    expect(result.getUTCFullYear()).toBe(2021);
    expect(result.getUTCMonth()).toBe(7);
    expect(result.getUTCDate()).toBe(20);
    expect(result.getUTCHours()).toBe(0);
    expect(result.getUTCMinutes()).toBe(0);
    expect(result.getUTCSeconds()).toBe(0);
    expect(result.getUTCMilliseconds()).toBe(0);
  });

  test("handles leap day", () => {
    const date = Temporal.PlainDate.from("2020-02-29");
    const result = plainDateToDate(date);

    expect(result.toISOString()).toBe("2020-02-29T00:00:00.000Z");
  });

  test("does not have off-by-one month issues", () => {
    const date = Temporal.PlainDate.from("2024-01-01");
    const result = plainDateToDate(date);

    expect(result.toISOString()).toBe("2024-01-01T00:00:00.000Z");
  });
});

void suite("dateToPlainDate", () => {
  test("converts a Date to a PlainDate using UTC fields", () => {
    const date = new Date("2021-08-20T00:00:00.000Z");
    const result = dateToPlainDate(date);

    expect(
      Temporal.PlainDate.compare(result, Temporal.PlainDate.from("2021-08-20")),
    ).toBe(0);
  });

  test("ignores any time component", () => {
    const date = new Date("2021-08-20T15:30:45.123Z");
    const result = dateToPlainDate(date);

    expect(
      Temporal.PlainDate.compare(result, Temporal.PlainDate.from("2021-08-20")),
    ).toBe(0);
  });

  test("is not sensitive to local timezone for late-night UTC timestamps", () => {
    const date = new Date("2021-08-20T23:30:00.000Z");
    const result = dateToPlainDate(date);

    expect(
      Temporal.PlainDate.compare(result, Temporal.PlainDate.from("2021-08-20")),
    ).toBe(0);
  });

  test("round-trips with plainDateToDate", () => {
    const plainDate = Temporal.PlainDate.from("2020-02-29");
    const date = plainDateToDate(plainDate);
    const result = dateToPlainDate(date);

    expect(Temporal.PlainDate.compare(result, plainDate)).toBe(0);
  });
});

void suite("parsePlainDateStringToUtcDate", () => {
  test("returns null when undefined", () => {
    expect(parsePlainDateStringToUtcDate(undefined)).toBeNull();
  });

  test("parses a valid date at UTC midnight", () => {
    const date = parsePlainDateStringToUtcDate("2025-07-24");
    expect(date).not.toBeNull();
    expect(date?.toISOString()).toBe("2025-07-24T00:00:00.000Z");
  });

  test("rejects invalid formats", () => {
    expect(parsePlainDateStringToUtcDate("2025-7-24")).toBeNull();
    expect(parsePlainDateStringToUtcDate("2025/07/24")).toBeNull();
    expect(parsePlainDateStringToUtcDate(" 2025-07-24")).toBeNull();
  });

  test("rejects invalid calendar dates", () => {
    expect(parsePlainDateStringToUtcDate("2025-13-01")).toBeNull();
    expect(parsePlainDateStringToUtcDate("2025-02-30")).toBeNull();
    expect(parsePlainDateStringToUtcDate("2025-00-10")).toBeNull();
    expect(parsePlainDateStringToUtcDate("2025-01-00")).toBeNull();
  });
});

void suite("PLAIN_DATE_STRING_REGEX", () => {
  test("accepts strict YYYY-MM-DD", () => {
    expect(PLAIN_DATE_STRING_REGEX.test("2025-07-24")).toBe(true);
  });

  test("rejects non-strict formats", () => {
    expect(PLAIN_DATE_STRING_REGEX.test("2025-7-24")).toBe(false);
    expect(PLAIN_DATE_STRING_REGEX.test(" 2025-07-24")).toBe(false);
    expect(PLAIN_DATE_STRING_REGEX.test("2025-07-24 ")).toBe(false);
    expect(PLAIN_DATE_STRING_REGEX.test("20250724")).toBe(false);
    expect(PLAIN_DATE_STRING_REGEX.test("2025/07/24")).toBe(false);
  });
});
