export interface TtmlSpan {
  readonly ["#text"]?: string;
  readonly begin?: string | number;
  readonly end?: string | number;
  readonly dur?: string | number;
}

export interface TtmlParagraph extends TtmlSpan {
  readonly span?: TtmlSpan | readonly TtmlSpan[];
}

export interface TtmlDiv {
  readonly p?: TtmlParagraph | readonly TtmlParagraph[];
}

export interface TtmlBody {
  readonly div?:
    | TtmlDiv
    | readonly TtmlDiv[]
    | TtmlParagraph
    | readonly TtmlParagraph[];
}

export interface TtmlRoot {
  readonly body?: TtmlBody;
}

// Root is discovered case-insensitively at runtime; no fixed variants here.

export function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export function toArray<E>(x: E | readonly E[] | undefined): readonly E[] {
  if (x == null) return [];
  return (
    Array.isArray(x) ? (x as readonly E[]) : ([x] as const)
  ) as readonly E[];
}
