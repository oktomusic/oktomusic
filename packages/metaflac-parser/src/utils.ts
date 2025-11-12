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
