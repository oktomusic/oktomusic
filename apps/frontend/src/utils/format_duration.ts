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
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(hours.toString());
  }
  parts.push(minutes.toString().padStart(hours > 0 ? 2 : 1, "0"));
  parts.push(seconds.toString().padStart(2, "0"));

  return parts.join(":");
}
