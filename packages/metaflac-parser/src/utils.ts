import z from "zod";
import { Temporal } from "temporal-polyfill";

export type MetaflacLinesParseResult = Record<string, string[]>;

export const lineRegex = /^([a-zA-Z]*)=(.*)$/;
export const isrcRegex = /^[A-Z]{2}-?\w{3}-?\d{2}-?\d{5}$/;

export function parseLine(line: string): [string, string] | null {
  const match = lineRegex.exec(line);
  if (match) {
    const [, key, value] = match;
    return [key.toUpperCase(), value];
  }
  return null;
}

export function parseOutput(data: string) {
  const lines = data.trim().split("\n");

  const result: MetaflacLinesParseResult = {};
  for (const line of lines) {
    const parsed = parseLine(line);
    if (parsed) {
      const [key, value] = parsed;
      if (key in result) {
        result[key].push(value);
      } else {
        result[key] = [value];
      }
    }
  }
  return result;
}

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Zod schema for a strict ISO-8601 calendar date string (`YYYY-MM-DD`).
 *
 * - Input must match the exact format (no whitespace).
 * - Output is a `Temporal.PlainDate`.
 * - Invalid dates are rejected (e.g. `2021-02-30`, `2021-13-01`).
 *
 * Example:
 * `zPlainDate.parse("2021-08-20")` => `Temporal.PlainDate(2021-08-20)`
 */
export const zPlainDate = z.string().transform((val, ctx) => {
  if (!dateRegex.test(val)) {
    ctx.addIssue({
      code: "custom",
      message: "Invalid date format (YYYY-MM-DD)",
    });
    return z.NEVER;
  }

  try {
    return Temporal.PlainDate.from(val, { overflow: "reject" });
  } catch {
    ctx.addIssue({
      code: "custom",
      message: "Invalid calendar date",
    });
    return z.NEVER;
  }
});
