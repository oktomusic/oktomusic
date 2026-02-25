import { LyricsChunk, LyricsLine } from "../api/graphql/gql/graphql";

/**
 * Returns whether the given playback position falls within the time span of the lyrics line.
 *
 * The `LyricsLine` uses `ts` as the start timestamp and `te` as the end timestamp
 * (typically in milliseconds from the beginning of the track). A line is considered
 * "current" when `currentPosition` is greater than or equal to `ts` and strictly less than `te`.
 *
 * @param currentPosition - Current playback position in the same time units as `line.ts`/`line.te`.
 * @param line - The lyrics line whose time window is checked (`ts` = start, `te` = end).
 * @returns `true` if the line is the active line at `currentPosition`, otherwise `false`.
 */
export function isCurrentLine(currentPosition: number, line: LyricsLine) {
  return currentPosition >= line.ts && currentPosition < line.te;
}

/**
 * Returns whether the current playback position has reached or passed
 * the start of a given word in the lyrics.
 *
 * @param currentPosition - The current playback position (for example, in milliseconds).
 * @param offset - A timing offset applied to the word's position (positive or negative),
 *                 used to fine-tune when the word is considered "passed".
 * @param word - The lyrics chunk representing the word. Its `d` property denotes
 *               the word's base timestamp relative to the lyrics timing reference.
 * @returns `true` if `currentPosition` is greater than or equal to `word.d + offset`,
 *          meaning the word is considered passed; otherwise `false`.
 */
export function isWordPassed(
  currentPosition: number,
  offset: number,
  word: LyricsChunk,
) {
  return currentPosition >= word.d + offset;
}
