import { describe, it, expect, beforeEach } from "vitest";
import applyColorProperties from "./vibrant_colors";
import type { VibrantColors } from "../atoms/player/machine";

describe("applyColorProperties", () => {
  let doc: Document;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument("test");
  });

  it("sets all CSS variables when colors are provided", () => {
    const colors: VibrantColors = {
      vibrant: "#ff0000",
      darkVibrant: "#990000",
      lightVibrant: "#ff6666",
      muted: "#00ff00",
      darkMuted: "#009900",
      lightMuted: "#66ff66",
    };

    applyColorProperties(doc, colors);

    const style = doc.documentElement.style;

    expect(style.getPropertyValue("--album-color-vibrant")).toBe("#ff0000");
    expect(style.getPropertyValue("--album-color-vibrant-dark")).toBe(
      "#990000",
    );
    expect(style.getPropertyValue("--album-color-vibrant-light")).toBe(
      "#ff6666",
    );
    expect(style.getPropertyValue("--album-color-muted")).toBe("#00ff00");
    expect(style.getPropertyValue("--album-color-muted-dark")).toBe("#009900");
    expect(style.getPropertyValue("--album-color-muted-light")).toBe("#66ff66");
  });

  it("clears all CSS variables when colors is null", () => {
    // Pre-populate styles
    doc.documentElement.style.setProperty("--album-color-vibrant", "#123456");

    applyColorProperties(doc, null);

    const style = doc.documentElement.style;

    expect(style.getPropertyValue("--album-color-vibrant")).toBe("");
    expect(style.getPropertyValue("--album-color-vibrant-dark")).toBe("");
    expect(style.getPropertyValue("--album-color-vibrant-light")).toBe("");
    expect(style.getPropertyValue("--album-color-muted")).toBe("");
    expect(style.getPropertyValue("--album-color-muted-dark")).toBe("");
    expect(style.getPropertyValue("--album-color-muted-light")).toBe("");
  });

  it("does not throw when called with null colors", () => {
    expect(() => applyColorProperties(doc, null)).not.toThrow();
  });
});
