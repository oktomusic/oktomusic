/**
 * Convert DateTime strings to Date objects
 */
export function parseDateTime(value: unknown): Date | null {
  if (typeof value === "string") {
    return new Date(value);
  }
  if (value instanceof Date) {
    return value;
  }
  return null;
}
