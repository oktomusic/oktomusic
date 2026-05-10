import fs from "node:fs";
import path from "node:path";

/**
 * Resolve a child path against a base directory and return the normalized absolute path
 * when the resolved target exists, stays within the base directory, and optionally
 * matches a filesystem type.
 *
 * This helper:
 * - resolves `childPath` with `path.resolve(basePath, childPath)`
 * - rejects paths that resolve outside `basePath` or across roots
 * - when `immediate` is `true`, allows only direct children (no nested segments)
 * - returns `null` when the resolved path does not exist or fails the type check
 *
 * Note: this check is lexical only and does not resolve symlinks. Type checks use
 * `fs.statSync`, which follows symlinks. If symlink escapes matter, validate with
 * `fs.realpath` or similar.
 *
 * @param basePath Base directory to contain the child.
 * @param childPath Relative or absolute child path to resolve.
 * @param immediate If `true`, only allow direct children (no nested paths). Default is `false`.
 * @param type When set, require the target to be a "file" or "directory". Default is `null`.
 * @returns The normalized absolute path, or `null` if invalid or missing.
 */
export function resolveChildrenPath(
  basePath: string,
  childPath: string,
  immediate: boolean = false,
  type: "file" | "directory" | null = null,
): string | null {
  const fullPath = path.resolve(basePath, childPath);
  const relativePath = path.relative(basePath, fullPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  if (
    immediate &&
    (relativePath === "" ||
      relativePath === "." ||
      relativePath.includes(path.sep))
  ) {
    return null;
  }

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  if (type !== null) {
    const stats = fs.statSync(fullPath);

    if (type === "file" && !stats.isFile()) {
      return null;
    }

    if (type === "directory" && !stats.isDirectory()) {
      return null;
    }
  }

  return fullPath;
}
