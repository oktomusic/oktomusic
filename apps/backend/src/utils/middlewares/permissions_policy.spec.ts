import { describe, it, vi, expect } from "vitest";
import {
  getPermissionsPolicyString,
  PermissionsPolicyMap,
  permissionsPolicyMiddleware,
} from "./permissions_policy";
import { NextFunction, Request, Response } from "express";

describe("getPermissionsPolicyString", () => {
  it("renders disabled directives as empty parentheses", () => {
    const policy: Partial<PermissionsPolicyMap> = {
      accelerometer: [],
      geolocation: [],
      "aria-notify": [],
    };

    expect(getPermissionsPolicyString(policy as PermissionsPolicyMap)).toBe(
      "accelerometer=(), geolocation=(), aria-notify=()",
    );
  });

  it("renders wildcard directive correctly", () => {
    const policy: Partial<PermissionsPolicyMap> = {
      accelerometer: "*",
      geolocation: [],
      "aria-notify": [],
    };

    expect(getPermissionsPolicyString(policy as PermissionsPolicyMap)).toBe(
      "accelerometer=*, geolocation=(), aria-notify=()",
    );
  });

  it("renders self and src keywords verbatim", () => {
    const policy: Partial<PermissionsPolicyMap> = {
      accelerometer: "self",
      geolocation: "src",
      "aria-notify": [],
    };

    expect(getPermissionsPolicyString(policy as PermissionsPolicyMap)).toBe(
      "accelerometer=(self), geolocation=(src), aria-notify=()",
    );
  });

  it("renders string array values as quoted origins", () => {
    const policy: Partial<PermissionsPolicyMap> = {
      accelerometer: ["https://example.com"],
      geolocation: ["https://a.com", "https://b.com"],
      "aria-notify": [],
    };

    expect(getPermissionsPolicyString(policy as PermissionsPolicyMap)).toBe(
      'accelerometer=("https://example.com"), ' +
        'geolocation=("https://a.com" "https://b.com"), ' +
        "aria-notify=()",
    );
  });

  it("handles mixed keywords and origins in arrays", () => {
    const policy: Partial<PermissionsPolicyMap> = {
      accelerometer: ["self", "https://example.com"],
      geolocation: [],
      "aria-notify": [],
    };

    expect(getPermissionsPolicyString(policy as PermissionsPolicyMap)).toBe(
      'accelerometer=(self "https://example.com"), ' +
        "geolocation=(), aria-notify=()",
    );
  });

  it("preserves directive order as defined in the object", () => {
    const policy: Partial<PermissionsPolicyMap> = {
      "aria-notify": [],
      accelerometer: "self",
      geolocation: "*",
    };

    expect(getPermissionsPolicyString(policy as PermissionsPolicyMap)).toBe(
      "aria-notify=(), accelerometer=(self), geolocation=*",
    );
  });

  it("returns an empty string for an empty policy map", () => {
    expect(getPermissionsPolicyString({} as PermissionsPolicyMap)).toBe("");
  });
});

describe("permissionsPolicyMiddleware", () => {
  it("sets the Permissions-Policy header and calls next()", () => {
    const req = {} as Request;

    const setHeader = vi.fn();
    const res = {
      setHeader,
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    permissionsPolicyMiddleware(req, res, next);

    expect(setHeader).toHaveBeenCalledWith(
      "Permissions-Policy",
      expect.any(String),
    );
    expect(next).toHaveBeenCalledOnce();
  });
});
