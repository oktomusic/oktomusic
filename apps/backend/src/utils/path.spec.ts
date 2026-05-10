import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { resolveChildrenPath } from "./path";

describe("resolveChildrenPath", () => {
  let baseDir: string;

  beforeEach(() => {
    baseDir = fs.mkdtempSync(path.join(os.tmpdir(), "oktomusic-path-"));
  });

  afterEach(() => {
    fs.rmSync(baseDir, { recursive: true, force: true });
  });

  it("returns an absolute path for an existing file", () => {
    const child = "child.txt";
    fs.writeFileSync(path.join(baseDir, child), "ok");

    expect(resolveChildrenPath(baseDir, child)).toBe(path.join(baseDir, child));
  });

  it("returns a normalized absolute path for nested files", () => {
    const nested = path.join("nested", "child.txt");
    fs.mkdirSync(path.join(baseDir, "nested"), { recursive: true });
    fs.writeFileSync(path.join(baseDir, nested), "ok");

    expect(resolveChildrenPath(baseDir, nested)).toBe(
      path.join(baseDir, nested),
    );
  });

  it("returns a direct child path when immediate is true", () => {
    const child = "direct.txt";
    fs.writeFileSync(path.join(baseDir, child), "ok");

    expect(resolveChildrenPath(baseDir, child, true)).toBe(
      path.join(baseDir, child),
    );
  });

  it("returns null for nested paths when immediate is true", () => {
    const nested = path.join("nested", "child.txt");
    fs.mkdirSync(path.join(baseDir, "nested"), { recursive: true });
    fs.writeFileSync(path.join(baseDir, nested), "ok");

    expect(resolveChildrenPath(baseDir, nested, true)).toBeNull();
  });

  it("accepts absolute child paths that stay within the base", () => {
    const child = "absolute.txt";
    const fullPath = path.join(baseDir, child);
    fs.writeFileSync(fullPath, "ok");

    expect(resolveChildrenPath(baseDir, fullPath)).toBe(fullPath);
  });

  it("returns null when the target does not exist", () => {
    expect(resolveChildrenPath(baseDir, "missing.txt")).toBeNull();
  });

  it("returns null when the child resolves outside the base", () => {
    const outsideName = `${path.basename(baseDir)}-outside.txt`;
    const outsidePath = path.join(path.dirname(baseDir), outsideName);
    fs.writeFileSync(outsidePath, "no");

    try {
      expect(resolveChildrenPath(baseDir, `../${outsideName}`)).toBeNull();
    } finally {
      fs.rmSync(outsidePath, { force: true });
    }
  });

  it("returns null when type is file but target is a directory", () => {
    const childDir = "child-dir";
    fs.mkdirSync(path.join(baseDir, childDir));

    expect(resolveChildrenPath(baseDir, childDir, false, "file")).toBeNull();
  });

  it("returns null when type is directory but target is a file", () => {
    const child = "child.txt";
    fs.writeFileSync(path.join(baseDir, child), "ok");

    expect(resolveChildrenPath(baseDir, child, false, "directory")).toBeNull();
  });

  it("returns the path when the type matches", () => {
    const childFile = "child.txt";
    const childDir = "child-dir";
    fs.writeFileSync(path.join(baseDir, childFile), "ok");
    fs.mkdirSync(path.join(baseDir, childDir));

    expect(resolveChildrenPath(baseDir, childFile, false, "file")).toBe(
      path.join(baseDir, childFile),
    );
    expect(resolveChildrenPath(baseDir, childDir, false, "directory")).toBe(
      path.join(baseDir, childDir),
    );
  });
});
