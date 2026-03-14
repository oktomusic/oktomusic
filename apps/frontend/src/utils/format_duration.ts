import { Temporal } from "temporal-polyfill";

type FormatDurationLongResult = (
  | {
      readonly hours: number;
      readonly minutes: number;
      readonly seconds: number;
    }
  | {
      readonly minutes: number;
      readonly seconds: number;
    }
  | {
      readonly seconds: number;
    }
) & {
  /**
   * Machine readable datetime string for the <time> element's datetime attribute, in ISO 8601 duration format (e.g., "PT1H1M1S" for 1 hour, 1 minute, and 1 second).
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/time
   */
  readonly datetime: string;
};

/**
 * Split a duration in milliseconds into components (hours, minutes, seconds) with TypeScript type discrimination for use in Lingui translations.
 * Also includes a machine-readable ISO 8601 duration string for the <time> element's datetime attribute.
 *
 * Examples:
 * - 3661000 ms -> { hours: 1, minutes: 1, seconds: 1, datetime: "PT1H1M1S" }
 * - 61000 ms  -> { minutes: 1, seconds: 1, datetime: "PT1M1S" }
 * - 5000 ms   -> { seconds: 5, datetime: "PT5S" }
 *
 * @param durationMs - Duration in milliseconds.
 * @returns Object with duration components and ISO 8601 datetime string for translatable formatting.
 */
export function getDurationComponents(
  durationMs: number,
): FormatDurationLongResult {
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const datetime = Temporal.Duration.from({
    hours,
    minutes,
    seconds,
  }).toString();

  if (hours > 0) {
    return { hours, minutes, seconds, datetime };
  }
  if (minutes > 0) {
    return { minutes, seconds, datetime };
  }
  return { seconds, datetime };
}

/**
 * Formats a duration given in milliseconds into a human-readable string.
 *
 * Examples:
 * - 3661000 ms -> "1:01:01"
 * - 61000 ms  -> "1:01"
 * - 5000 ms   -> "0:05"
 *
 * @param durationMs - Duration in milliseconds.
 * @returns Formatted duration string.
 */
export function formatDuration(durationMs: number): string {
  const components = getDurationComponents(durationMs);
  const parts: string[] = [];

  if ("hours" in components) {
    parts.push(components.hours.toString());
    parts.push(components.minutes.toString().padStart(2, "0"));
    parts.push(components.seconds.toString().padStart(2, "0"));
  } else if ("minutes" in components) {
    parts.push(components.minutes.toString());
    parts.push(components.seconds.toString().padStart(2, "0"));
  } else {
    parts.push("0");
    parts.push(components.seconds.toString().padStart(2, "0"));
  }

  return parts.join(":");
}
