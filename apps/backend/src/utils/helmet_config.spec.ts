import { describe, it, expect } from "vitest";
import { mergeDirectivesCSP } from "./helmet_config";

type CSPDirectives = Record<string, string[]>;

describe("mergeDirectivesCSP", () => {
  it("merges a single CSP object unchanged", () => {
    const input: CSPDirectives = {
      defaultSrc: ["'none'"],
      imgSrc: ["'self'"],
    };

    const result = mergeDirectivesCSP([input]);

    expect(result).toEqual(input);
    expect(result).not.toBe(input); // should return a new object
  });

  it("merges multiple CSP objects by directive", () => {
    const base: CSPDirectives = {
      defaultSrc: ["'none'"],
      imgSrc: ["'self'"],
    };

    const dev: CSPDirectives = {
      imgSrc: ["data:"],
      scriptSrcElem: ["'unsafe-inline'"],
    };

    const result = mergeDirectivesCSP([base, dev]);

    expect(result).toEqual({
      defaultSrc: ["'none'"],
      imgSrc: ["'self'", "data:"],
      scriptSrcElem: ["'unsafe-inline'"],
    });
  });

  it("deduplicates directive values while preserving order", () => {
    const a: CSPDirectives = {
      imgSrc: ["'self'", "data:"],
    };

    const b: CSPDirectives = {
      imgSrc: ["data:", "blob:"],
    };

    const result = mergeDirectivesCSP([a, b]);

    expect(result.imgSrc).toEqual(["'self'", "data:", "blob:"]);
  });

  it("handles empty input array", () => {
    const result = mergeDirectivesCSP([]);

    expect(result).toEqual({});
  });

  it("handles empty directive objects", () => {
    const result = mergeDirectivesCSP([{}, {}]);

    expect(result).toEqual({});
  });

  it("does not mutate input objects", () => {
    const base: CSPDirectives = {
      defaultSrc: ["'none'"],
    };

    const dev: CSPDirectives = {
      defaultSrc: ["'self'"],
    };

    const baseClone = structuredClone(base);
    const devClone = structuredClone(dev);

    mergeDirectivesCSP([base, dev]);

    expect(base).toEqual(baseClone);
    expect(dev).toEqual(devClone);
  });

  it("supports more than two CSP sources", () => {
    const a: CSPDirectives = {
      imgSrc: ["'self'"],
    };

    const b: CSPDirectives = {
      imgSrc: ["data:"],
    };

    const c: CSPDirectives = {
      imgSrc: ["blob:"],
    };

    const result = mergeDirectivesCSP([a, b, c]);

    expect(result).toEqual({
      imgSrc: ["'self'", "data:", "blob:"],
    });
  });

  it("merges unrelated directives independently", () => {
    const a: CSPDirectives = {
      imgSrc: ["'self'"],
    };

    const b: CSPDirectives = {
      scriptSrcElem: ["'unsafe-inline'"],
    };

    const result = mergeDirectivesCSP([a, b]);

    expect(result).toEqual({
      imgSrc: ["'self'"],
      scriptSrcElem: ["'unsafe-inline'"],
    });
  });
});
