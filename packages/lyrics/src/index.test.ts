import { suite, test, expect } from "vitest";
import { myFunction } from ".";

void suite("Lyrics parser", () => {
  void test("myFunction", () => {
    expect(myFunction()).toBe("Hello, world!");
  });
});
