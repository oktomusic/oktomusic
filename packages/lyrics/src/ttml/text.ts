import type { TtmlParagraph, TtmlSpan } from "./types";

export function extractParagraphText(p: TtmlParagraph): string {
  const spans = normalizedSpans(p);
  if (spans.length === 0) {
    const t = p["#text"];
    return typeof t === "string" ? t.trim() : "";
  }
  let out = "";
  for (const sp of spans) {
    const t = sp["#text"];
    if (typeof t === "string") out += t;
  }
  return out;
}

export function normalizedSpans(p: TtmlParagraph): readonly TtmlSpan[] {
  const raw = p.span;
  if (!raw) return [];
  const arr: readonly TtmlSpan[] = Array.isArray(raw) ? raw : [raw];
  return arr;
}
