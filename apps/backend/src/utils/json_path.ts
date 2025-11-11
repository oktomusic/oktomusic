type JsonPathPlaceholders = Record<string, string | number>;

/**
 * Resolve placeholders in the path string
 * Supports the ${name} syntax
 */
function resolvePlaceholders(
  path: string,
  placeholders?: JsonPathPlaceholders,
) {
  if (!placeholders) return path;

  let resolved = path;

  // Replace ${name} syntax
  resolved = resolved.replace(/<([^}]+)>/g, (_, name: string) => {
    const val = placeholders[name];
    return val !== undefined && val !== null ? String(val) : "";
  });

  return resolved;
}

/**
 * Get a value from an object using a JSON path with optional placeholders
 * Supports dot notation and array indices
 */
function getByPath(
  obj: unknown,
  path: string,
  placeHolders?: JsonPathPlaceholders,
): unknown {
  const resolvedPath = resolvePlaceholders(path, placeHolders);
  const parts = resolvedPath.split(".").filter(Boolean);

  let current: unknown = obj;

  for (const key of parts) {
    if (current === undefined || current === null) return undefined;

    if (Array.isArray(current) && /^\d+$/.test(key)) {
      const idx = Number(key);
      current = current[idx];
      continue;
    }

    if (typeof current === "object" && current !== null) {
      const rec = current as Record<string, unknown>;
      current = Object.prototype.hasOwnProperty.call(rec, key)
        ? rec[key]
        : undefined;
      continue;
    }

    return undefined;
  }

  return current;
}

export type { JsonPathPlaceholders };
export default getByPath;
