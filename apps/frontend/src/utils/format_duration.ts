type FormatDurationLongResult =
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
    };

/**
 * Split a duration in milliseconds into components (hours, minutes, seconds) with TypeScript type discrimination for use in Lingui translations.
 *
 * Examples:
 * - 3661000 ms -> { hours: 1, minutes: 1, seconds: 1 }
 * - 61000 ms  -> { minutes: 1, seconds: 1 }
 * - 5000 ms   -> { seconds: 5 }
 *
 * @param durationMs - Duration in milliseconds.
 * @returns Object with duration components for translatable formatting.
 */
export function getDurationComponents(
  durationMs: number,
): FormatDurationLongResult {
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return { hours, minutes, seconds };
  }
  if (minutes > 0) {
    return { minutes, seconds };
  }
  return { seconds };
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
