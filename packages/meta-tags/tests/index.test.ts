import { describe, expect, it } from "vitest";
import { compileMetaTags } from "../src";

describe("compileMetaTags", () => {
  it("returns an array of compiled meta tags", () => {
    const result = compileMetaTags({
      "daiu:level": "assist",
      "og:locale:alternate": ["en_US", "fr_FR"],
    });

    expect(result).toEqual([
      {
        property: "daiu:level",
        content: "assist",
      },
      {
        property: "og:locale:alternate",
        content: "en_US",
      },
      {
        property: "og:locale:alternate",
        content: "fr_FR",
      },
    ]);
  });

  it("handles scalar string fields", () => {
    const result = compileMetaTags({
      "og:title": "My Album",
      "og:description": "A great album",
      "og:site_name": "Oktomusic",
    });

    expect(result).toEqual([
      { property: "og:title", content: "My Album" },
      { property: "og:description", content: "A great album" },
      { property: "og:site_name", content: "Oktomusic" },
    ]);
  });

  it("handles URL fields", () => {
    const result = compileMetaTags({
      "og:url": "https://oktomusic.example.com/",
      "og:image": "https://oktomusic.example.com/cover.png",
    });

    expect(result).toEqual([
      { property: "og:url", content: "https://oktomusic.example.com/" },
      {
        property: "og:image",
        content: "https://oktomusic.example.com/cover.png",
      },
    ]);
  });

  it("handles enum fields", () => {
    const result = compileMetaTags({
      "og:type": "music.album",
      "og:determiner": "a",
      "daiu:origin": "HM",
      "daiu:verification": "DAIU 1.0",
    });

    expect(result).toEqual([
      { property: "og:type", content: "music.album" },
      { property: "og:determiner", content: "a" },
      { property: "daiu:origin", content: "HM" },
      { property: "daiu:verification", content: "DAIU 1.0" },
    ]);
  });

  it("applies transforms — og:video:width and og:video:height become strings", () => {
    const result = compileMetaTags({
      "og:video:width": 1920,
      "og:video:height": 1080,
    });

    expect(result).toEqual([
      { property: "og:video:width", content: "1920" },
      { property: "og:video:height", content: "1080" },
    ]);
  });

  it("handles integer fields without transforms", () => {
    const result = compileMetaTags({
      "og:image:width": 800,
      "og:image:height": 600,
    });

    expect(result).toEqual([
      { property: "og:image:width", content: "800" },
      { property: "og:image:height", content: "600" },
    ]);
  });

  it("handles an empty og:locale:alternate array", () => {
    const result = compileMetaTags({
      "og:locale:alternate": [],
    });

    expect(result).toEqual([]);
  });

  it("handles a single-item og:locale:alternate array", () => {
    const result = compileMetaTags({
      "og:locale:alternate": ["fr_FR"],
    });

    expect(result).toEqual([
      { property: "og:locale:alternate", content: "fr_FR" },
    ]);
  });

  it("returns an empty array for empty input", () => {
    const result = compileMetaTags({});
    expect(result).toEqual([]);
  });

  it("throws on invalid enum value", () => {
    expect(() =>
      compileMetaTags({
        // @ts-expect-error intentionally invalid
        "og:type": "invalid_type",
      }),
    ).toThrow();
  });

  it("throws on invalid URL", () => {
    expect(() =>
      compileMetaTags({
        "og:url": "not-a-url",
      }),
    ).toThrow();
  });

  it("throws on invalid locale code in og:locale:alternate", () => {
    expect(() =>
      compileMetaTags({
        // @ts-expect-error intentionally invalid
        "og:locale:alternate": ["INVALID"],
      }),
    ).toThrow();
  });

  it("throws on non-positive integer for og:image:width", () => {
    expect(() =>
      compileMetaTags({
        "og:image:width": -1,
      }),
    ).toThrow();
  });
});
