import { suite, test, expect } from "vitest";

import { parseTtmlTimeToMs } from "./ttml/time";

void suite("TTML time parsing", () => {
  void test("clock times hh:mm:ss(.mmm)", () => {
    expect(parseTtmlTimeToMs("00:00:05")).toBe(5000);
    expect(parseTtmlTimeToMs("00:01:02.345")).toBe(62_345);
    expect(parseTtmlTimeToMs("01:00:00")).toBe(3_600_000);
  });

  void test("clock times mm:ss(.mmm)", () => {
    expect(parseTtmlTimeToMs("01:02")).toBe(62_000);
    expect(parseTtmlTimeToMs("02:03.5")).toBe(123_500);
  });

  void test("metric offsets (ms/s/m/h)", () => {
    expect(parseTtmlTimeToMs("750ms")).toBe(750);
    expect(parseTtmlTimeToMs("1.5s")).toBe(1500);
    expect(parseTtmlTimeToMs("2m")).toBe(120_000);
    expect(parseTtmlTimeToMs("1h")).toBe(3_600_000);
  });

  void test("plain seconds (number or string)", () => {
    expect(parseTtmlTimeToMs(2)).toBe(2);
    expect(parseTtmlTimeToMs("2")).toBe(2000);
    expect(parseTtmlTimeToMs("2.25")).toBe(2250);
  });

  void test("comma decimal separator is accepted", () => {
    expect(parseTtmlTimeToMs("1,25s")).toBe(1250);
  });

  void test("invalid time returns undefined", () => {
    expect(parseTtmlTimeToMs("abc")).toBeUndefined();
    expect(parseTtmlTimeToMs("01:xx:03")).toBeUndefined();
  });
});
