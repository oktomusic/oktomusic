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
 * Parses a strict `YYYY-MM-DD` date string into a JavaScript `Date` at UTC midnight.
 *
 * Returns `null` when:
 * - input is missing (`undefined`)
 * - format is not exactly `YYYY-MM-DD`
 * - date is not a valid calendar date (e.g. `2025-02-30`)
 */
export function parsePlainDateStringToUtcDate(
  date: string | undefined,
): Date | null {
  if (!date) return null;
  if (!PLAIN_DATE_STRING_REGEX.test(date)) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;

  const [, yearRaw, monthRaw, dayRaw] = match;
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

  // Validate calendar correctness via round-trip.
  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() + 1 !== month ||
    utcDate.getUTCDate() !== day
  ) {
    return null;
  }

  return utcDate;
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
