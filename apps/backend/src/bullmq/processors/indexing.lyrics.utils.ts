import fs from "node:fs/promises";
import path from "node:path";

import {
  parseLRCtoLyrics,
  parseTTMLtoLyrics,
  type Lyrics,
} from "@oktomusic/lyrics";

export interface LyricsParseError {
  readonly filePath: string;
  readonly message: string;
}

export interface LyricsParseResult {
  readonly lyrics: Lyrics | null;
  readonly error?: LyricsParseError;
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error;
}

type ReadUtf8Result =
  | { readonly status: "ok"; readonly content: string }
  | { readonly status: "missing" }
  | { readonly status: "error"; readonly error: Error };

async function readUtf8IfExists(filePath: string): Promise<ReadUtf8Result> {
  try {
    const buf = await fs.readFile(filePath);
    return { status: "ok", content: buf.toString("utf8") };
  } catch (error) {
    if (isErrnoException(error) && error.code === "ENOENT") {
      return { status: "missing" };
    }

    return {
      status: "error",
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

export async function findAndParseLyrics(
  flacFilePath: string,
): Promise<LyricsParseResult> {
  const parsed = path.parse(flacFilePath);
  const basePath = path.join(parsed.dir, parsed.name);

  const ttmlPath = `${basePath}.ttml`;
  const lrcPath = `${basePath}.lrc`;

  // 1) TTML preferred
  const ttmlRead = await readUtf8IfExists(ttmlPath);
  if (ttmlRead.status === "ok") {
    try {
      return { lyrics: parseTTMLtoLyrics(ttmlRead.content) };
    } catch (error) {
      return {
        lyrics: null,
        error: {
          filePath: ttmlPath,
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  if (ttmlRead.status === "error") {
    return {
      lyrics: null,
      error: {
        filePath: ttmlPath,
        message: ttmlRead.error.message,
      },
    };
  }

  // 2) LRC fallback
  const lrcRead = await readUtf8IfExists(lrcPath);
  if (lrcRead.status === "ok") {
    try {
      return { lyrics: parseLRCtoLyrics(lrcRead.content) };
    } catch (error) {
      return {
        lyrics: null,
        error: {
          filePath: lrcPath,
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  if (lrcRead.status === "error") {
    return {
      lyrics: null,
      error: {
        filePath: lrcPath,
        message: lrcRead.error.message,
      },
    };
  }

  return { lyrics: null };
}
