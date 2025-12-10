import { suite, test, expect } from "vitest";

import { LyricsSchema } from "./model";

void suite("Lyrics schema", () => {
  void test("accepts a valid lyrics object", () => {
    const data = [
      {
        ts: 1000,
        te: 2000,
        l: [
          { c: "Hello", d: 1 },
          { c: ",", d: 500 },
          { c: "world", d: 800 },
        ],
        t: "Hello, world",
      },
    ];

    const result = LyricsSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  void test("rejects non-positive ts/te/d", () => {
    const invalids = [
      // ts must be positive
      [
        {
          ts: 0,
          te: 100,
          l: [{ c: "a", d: 1 }],
          t: "a",
        },
      ],
      // te must be positive
      [
        {
          ts: 1,
          te: 0,
          l: [{ c: "a", d: 1 }],
          t: "a",
        },
      ],
      // d must be positive
      [
        {
          ts: 1,
          te: 2,
          l: [{ c: "a", d: 0 }],
          t: "a",
        },
      ],
    ];

    for (const sample of invalids) {
      const result = LyricsSchema.safeParse(sample);
      expect(result.success).toBe(false);
    }
  });

  void test("rejects wrong types and missing properties", () => {
    const invalids: unknown[] = [
      // Not an array
      { ts: 1, te: 2, l: [], t: "" },
      // Missing ts
      [
        {
          te: 2,
          l: [{ c: "a", d: 1 }],
          t: "a",
        },
      ],
      // Missing te
      [
        {
          ts: 1,
          l: [{ c: "a", d: 1 }],
          t: "a",
        },
      ],
      // l is not array
      [
        {
          ts: 1,
          te: 2,
          l: {} as unknown,
          t: "a",
        },
      ],
      // token missing c
      [
        {
          ts: 1,
          te: 2,
          l: [{ d: 1 } as unknown as { c: string; d: number }],
          t: "a",
        },
      ],
      // token d wrong type
      [
        {
          ts: 1,
          te: 2,
          l: [{ c: "a", d: "1" as unknown as number }],
          t: "a",
        },
      ],
    ];

    for (const sample of invalids) {
      const result = LyricsSchema.safeParse(sample);
      expect(result.success).toBe(false);
    }
  });

  void test("allows empty tokens array", () => {
    const data = [
      {
        ts: 1,
        te: 2,
        l: [],
        t: "",
      },
    ];
    const result = LyricsSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
