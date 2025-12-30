import { Temporal } from "temporal-polyfill";

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
