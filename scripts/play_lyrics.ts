#!/usr/bin/env tsx

/**
 * Karaoke-like CLI player for TTML lyrics.
 *
 * Usage:
 *   tsx scripts/play_lyrics.ts <path-to-file.ttml>
 *
 * Reads a TTML file, parses to Lyrics model, validates with Zod,
 * then plays a simple karaoke visualization in the terminal.
 */

import fs from "node:fs";
import path from "node:path";

import { parseTTMLtoLyrics } from "../packages/lyrics/src/ttml";
import { LyricsSchema } from "../packages/lyrics/src/model";

type Lyrics = import("../packages/lyrics/src/model").Lyrics;

const color = {
  dim: (s: string) => `\x1b[90m${s}\x1b[0m`,
  past: (s: string) => `\x1b[97m${s}\x1b[0m`,
  activeDone: (s: string) => `\x1b[97m${s}\x1b[0m`,
  activePending: (s: string) => `\x1b[90m${s}\x1b[0m`,
};

interface RenderOptions {
  readonly charProgressMode: boolean;
}

function renderCharProgress(
  seg: { readonly c: string; readonly d: number },
  local: number,
  nextOffset: number,
): string {
  const duration = nextOffset - seg.d;
  const t = Math.min(Math.max(local - seg.d, 0), Math.max(1, duration));
  const ratio = duration > 0 ? t / duration : 1;

  const total = seg.c.length;
  const lit = Math.round(ratio * total);

  return (
    color.activeDone(seg.c.slice(0, lit)) +
    color.activePending(seg.c.slice(lit))
  );
}

function renderWordProgress(
  seg: { readonly c: string; readonly d: number },
  local: number,
): string {
  return local >= seg.d ? color.activeDone(seg.c) : color.activePending(seg.c);
}

function renderLine(
  line: Lyrics[number],
  now: number,
  options: RenderOptions,
): string {
  if (now >= line.te) return color.past(line.t);
  if (now < line.ts) return color.dim(line.t);

  const local = now - line.ts;
  let out = "";
  for (let i = 0; i < line.l.length; i++) {
    const seg = line.l[i];
    const next = line.l[i + 1];
    const nextOffset = next?.d ?? line.te - line.ts;
    out += options.charProgressMode
      ? renderCharProgress(seg, local, nextOffset)
      : renderWordProgress(seg, local);
  }
  return out;
}

function usageAndExit(code = 1): never {
  console.error("Usage: tsx scripts/play_lyrics.ts <path-to-file.ttml>");
  process.exit(code);
}

function parseArgs(): {
  readonly filePath: string;
  readonly options: RenderOptions;
} {
  const [, , fp, ...rest] = process.argv;
  if (!fp) usageAndExit(2);
  const filePath = path.resolve(fp);
  const options: RenderOptions = {
    charProgressMode: rest.includes("--char"),
  };
  return { filePath, options };
}

function validateLyrics(lyrics: unknown): Lyrics {
  const res = LyricsSchema.safeParse(lyrics);
  if (!res.success) {
    console.error("Invalid lyrics schema:");
    const flat = res.error.flatten();
    console.error(JSON.stringify(flat, null, 2));
    process.exit(3);
  }
  return res.data;
}

async function startKaraoke(lyrics: Lyrics, options: RenderOptions) {
  console.log(color.dim("Starting lyrics...\n"));

  const start = Date.now();
  let printed = 1;
  console.log("");

  const lastEnd = lyrics.length ? lyrics[lyrics.length - 1].te : 0;

  function tick() {
    const now = Date.now() - start;

    let currentIndex = lyrics.length - 1;
    for (let i = 0; i < lyrics.length; i++) {
      if (now < lyrics[i].te) {
        currentIndex = i;
        break;
      }
    }

    const shouldShowNext =
      currentIndex >= 0 &&
      currentIndex < lyrics.length &&
      now >= lyrics[currentIndex].te;
    const visibleCount = Math.min(
      lyrics.length,
      shouldShowNext ? currentIndex + 2 : currentIndex + 1,
    );

    while (printed < visibleCount) {
      console.log("");
      printed++;
    }

    if (printed > 0) process.stdout.write(`\x1b[${printed}A`);
    for (let i = 0; i < visibleCount; i++) {
      const line = lyrics[i];
      const rendered =
        i === currentIndex
          ? renderLine(line, now, options)
          : i === currentIndex + 1 && shouldShowNext
            ? color.dim(line.t)
            : renderLine(line, now, options);

      process.stdout.write("\x1b[2K\r" + rendered + "\n");
    }
    if (printed > 0) process.stdout.write(`\x1b[${printed}B`);

    if (now <= lastEnd) setTimeout(tick, 33);
    else console.log("\nDone.");
  }

  tick();
}

function main() {
  const { filePath, options } = parseArgs();
  const xml = fs.readFileSync(filePath, "utf8");
  const lyrics = validateLyrics(parseTTMLtoLyrics(xml));
  void startKaraoke(lyrics, options);
}

main();
