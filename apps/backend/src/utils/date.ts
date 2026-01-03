import { Temporal } from "temporal-polyfill";

/**
 * Matches a strict ISO-like calendar date string: `YYYY-MM-DD`.
 *
 * Notes:
 * - No whitespace allowed.
 * - Always 4-digit year, 2-digit month, 2-digit day.
 */
export const PLAIN_DATE_STRING_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parses a strict `YYYY-MM-DD` date string into a `Temporal.PlainDate`.
 *
 * Returns `null` when:
 * - input is missing (`undefined`)
 * - format is not exactly `YYYY-MM-DD`
 * - date is not a valid calendar date (e.g. `2025-02-30`)
 */
export function parsePlainDateString(
  date: string | undefined,
): Temporal.PlainDate | null {
  if (!date) return null;
  if (!PLAIN_DATE_STRING_REGEX.test(date)) return null;

  try {
    return Temporal.PlainDate.from(date, { overflow: "reject" });
  } catch {
    return null;
  }
}

/**
 * Convert a `Temporal.PlainDate` to a JavaScript `Date` suitable for Prisma `DateTime` fields with `@db.Date`.
 *
 * Use UTC to avoid timezone drift issues.
 *
 * This logic can be removed once Prisma have [native support](https://github.com/prisma/prisma/issues/16119).
 */
export function plainDateToDate(date: Temporal.PlainDate): Date {
  return new Date(Date.UTC(date.year, date.month - 1, date.day));
}

/**
 * Convert a `Date` (from a Prisma `DateTime` field with `@db.Date`) to a `Temporal.PlainDate`.
 *
 * Use UTC to avoid timezone drift issues.
 *
 * Ignore any time component (which should be already discarded by Prisma).
 *
 * This logic can be removed once Prisma have [native support](https://github.com/prisma/prisma/issues/16119).
 */
export function dateToPlainDate(date: Date): Temporal.PlainDate {
  const utcYear = date.getUTCFullYear();
  const utcMonth = date.getUTCMonth() + 1; // Months are zero-based
  const utcDay = date.getUTCDate();

  return Temporal.PlainDate.from(
    {
      year: utcYear,
      month: utcMonth,
      day: utcDay,
    },
    {
      overflow: "reject",
    },
  );
}

/*prisma.track.findMany({
  where: { albumId },
  orderBy: [{ discNumber: "asc" }, { trackNumber: "asc" }],
});*/
