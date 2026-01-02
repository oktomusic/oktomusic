import { describe, expect, it } from "vitest";

import { BadRequestException } from "@nestjs/common";

import { ParseCuid2Pipe } from "./parse-cuid2.pipe";

describe("Cuid2ParsePipe", () => {
  it("returns the value when valid", () => {
    const pipe = new ParseCuid2Pipe();
    expect(pipe.transform("tz4a98xxat96iws9zmbrgj3a")).toBe(
      "tz4a98xxat96iws9zmbrgj3a",
    );
  });

  it("throws when empty", () => {
    const pipe = new ParseCuid2Pipe();
    expect(() => pipe.transform("")).toThrow(BadRequestException);
  });

  it("throws when contains uppercase or symbols", () => {
    const pipe = new ParseCuid2Pipe();
    expect(() => pipe.transform("ABC")).toThrow(BadRequestException);
    expect(() => pipe.transform("a_bc")).toThrow(BadRequestException);
  });

  it("throws when too long", () => {
    const pipe = new ParseCuid2Pipe();
    expect(() => pipe.transform("a".repeat(31))).toThrow(BadRequestException);
  });
});
