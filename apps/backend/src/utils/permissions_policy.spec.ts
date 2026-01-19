import { describe, it, expect } from "vitest";
import {
  getPermissionsPolicyString,
  PermissionsPolicyMap,
} from "./permissions_policy";

describe("getPermissionsPolicyString", () => {
  it("renders disabled directives as empty parentheses", () => {
    const policy: Partial<PermissionsPolicyMap> = {
      accelerometer: [],
      "ambient-light-sensor": [],
      "aria-notify": [],
    };

    expect(getPermissionsPolicyString(policy as PermissionsPolicyMap)).toBe(
      "accelerometer=(), ambient-light-sensor=(), aria-notify=()",
    );
  });

  it("renders wildcard directive correctly", () => {
    const policy: Partial<PermissionsPolicyMap> = {
      accelerometer: "*",
      "ambient-light-sensor": [],
      "aria-notify": [],
    };

    expect(getPermissionsPolicyString(policy as PermissionsPolicyMap)).toBe(
      "accelerometer=*, ambient-light-sensor=(), aria-notify=()",
    );
  });

  it("renders self and src keywords verbatim", () => {
    const policy: Partial<PermissionsPolicyMap> = {
      accelerometer: "self",
      "ambient-light-sensor": "src",
      "aria-notify": [],
    };

    expect(getPermissionsPolicyString(policy as PermissionsPolicyMap)).toBe(
      "accelerometer=(self), ambient-light-sensor=(src), aria-notify=()",
    );
  });

  it("renders string array values as quoted origins", () => {
    const policy: Partial<PermissionsPolicyMap> = {
      accelerometer: ["https://example.com"],
      "ambient-light-sensor": ["https://a.com", "https://b.com"],
      "aria-notify": [],
    };

    expect(getPermissionsPolicyString(policy as PermissionsPolicyMap)).toBe(
      'accelerometer=("https://example.com"), ' +
        'ambient-light-sensor=("https://a.com" "https://b.com"), ' +
        "aria-notify=()",
    );
  });

  it("handles mixed keywords and origins in arrays", () => {
    const policy: Partial<PermissionsPolicyMap> = {
      accelerometer: ["self", "https://example.com"],
      "ambient-light-sensor": [],
      "aria-notify": [],
    };

    expect(getPermissionsPolicyString(policy as PermissionsPolicyMap)).toBe(
      'accelerometer=(self "https://example.com"), ' +
        "ambient-light-sensor=(), aria-notify=()",
    );
  });

  it("preserves directive order as defined in the object", () => {
    const policy: Partial<PermissionsPolicyMap> = {
      "aria-notify": [],
      accelerometer: "self",
      "ambient-light-sensor": "*",
    };

    expect(getPermissionsPolicyString(policy as PermissionsPolicyMap)).toBe(
      "aria-notify=(), accelerometer=(self), ambient-light-sensor=*",
    );
  });

  it("returns an empty string for an empty policy map", () => {
    expect(getPermissionsPolicyString({} as PermissionsPolicyMap)).toBe("");
  });
});
