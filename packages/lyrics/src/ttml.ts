import { XMLParser } from "fast-xml-parser";

import type { Lyrics } from "./model";
import { parseTtmlTimeToMs } from "./ttml/time";
import { extractParagraphText, normalizedSpans } from "./ttml/text";
import type { TtmlParagraph, TtmlRoot } from "./ttml/types";
import { isRecord } from "./ttml/types";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
  trimValues: false,
  allowBooleanAttributes: true,
  ignoreDeclaration: true,
  textNodeName: "#text",
});

function pickRoot(doc: unknown): TtmlRoot | undefined {
  if (!isRecord(doc)) return undefined;
  const rec: Record<string, unknown> = doc;
  for (const key of Object.keys(rec)) {
    const lower = key.toLowerCase();
    if (lower === "tt" || lower === "ttml") {
      const node = rec[key];
      if (isRecord(node)) return node as TtmlRoot;
    }
  }
  return undefined;
}

function safeGet(obj: unknown, key: string): unknown {
  if (!isRecord(obj)) return undefined;
  const rec: Record<string, unknown> = obj;
  return Object.prototype.hasOwnProperty.call(rec, key) ? rec[key] : undefined;
}

function normalizeParagraphs(
  root: TtmlRoot | undefined,
): readonly TtmlParagraph[] {
  if (!root || !isRecord(root)) return [];
  const body = root.body;
  if (!isRecord(body)) return [];
  const div: unknown = safeGet(body, "div") ?? body;
  if (!div) return [];
  const pCandidates: unknown =
    (isRecord(div) ? safeGet(div, "p") : undefined) ?? div;
  if (!pCandidates) return [];
  const arr = Array.isArray(pCandidates) ? pCandidates : [pCandidates];
  return arr.filter(isRecord) as TtmlParagraph[];
}

export function parseTTMLtoLyrics(input: string): Lyrics {
  const xml = parser.parse(input) as unknown;
  const root = pickRoot(xml);
  const pList = normalizeParagraphs(root);

  const lines: Lyrics = [];

  for (const p of pList) {
    const lineText = extractParagraphText(p);
    const ts = parseTtmlTimeToMs(p.begin);
    let te = parseTtmlTimeToMs(p.end);
    const dur = parseTtmlTimeToMs(p.dur);
    if (ts == null && dur == null && te == null) continue;

    const startMs = Math.max(1, ts ?? 0);
    if (te == null && dur != null) te = startMs + dur;

    const spans = normalizedSpans(p);
    const tokens: { c: string; d: number }[] = [];

    if (spans.length === 0) {
      if (lineText) tokens.push({ c: lineText, d: 1 });
    } else {
      let runningOffset = 0;
      for (const sp of spans) {
        const text = typeof sp["#text"] === "string" ? sp["#text"] : "";
        if (!text) continue;
        let offset = runningOffset;
        const sb = parseTtmlTimeToMs(sp.begin);
        const se = parseTtmlTimeToMs(sp.end);
        const sd = parseTtmlTimeToMs(sp.dur);
        if (sb != null) offset = Math.max(0, sb - startMs);
        tokens.push({ c: text, d: Math.max(1, Math.round(offset)) });
        if (sd != null) runningOffset = offset + sd;
        else if (se != null) runningOffset = Math.max(0, se - startMs);
      }

      const haveAnyOffset = tokens.some((t) => t.d > 0);
      if (!haveAnyOffset && te != null) {
        const total = te - startMs;
        const totalChars = tokens.reduce((n, t) => n + t.c.length, 0) || 1;
        let acc = 0;
        for (const t of tokens) {
          const before = acc;
          acc += t.c.length;
          t.d = Math.max(1, Math.round((before / totalChars) * total));
        }
      }
    }

    if (te == null) {
      if (tokens.length > 0) {
        const lastOffset = tokens[tokens.length - 1]?.d ?? 1;
        te = startMs + Math.max(500, lastOffset + 500);
      } else {
        te = startMs + 2000;
      }
    }

    if (te <= startMs) te = startMs + 1;

    lines.push({
      ts: Math.round(startMs),
      te: Math.round(te),
      l: tokens,
      t: lineText,
    });
  }

  lines.sort((a, b) => a.ts - b.ts);
  return lines;
}
