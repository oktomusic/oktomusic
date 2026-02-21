import { LyricsChunk, LyricsLine } from "../api/graphql/gql/graphql";

export function isCurrentLine(currentPosition: number, line: LyricsLine) {
  return currentPosition >= line.ts && currentPosition < line.te;
}

export function isWordPassed(
  currentPosition: number,
  offset: number,
  word: LyricsChunk,
) {
  return currentPosition >= word.d + offset;
}
