/**
 * Track matching helpers used by the indexing worker.
 *
 * Pure functions only:
 * - No DB calls
 * - No filesystem
 * - No NestJS dependencies
 *
 * This keeps the matching/update logic unit-testable.
 */

/**
 * Normalizes an ISRC string:
 * - trims
 * - uppercases
 * - returns `undefined` when empty/undefined/null
 */
export function normalizeIsrc(isrc?: string | null): string | undefined {
  const normalized = isrc?.trim().toUpperCase();
  return normalized && normalized.length > 0 ? normalized : undefined;
}

/**
 * Normalizes a human-facing title:
 * - trims
 * - returns `undefined` when empty/undefined/null
 */
export function normalizeTitle(title?: string | null): string | undefined {
  const normalized = title?.trim();
  return normalized && normalized.length > 0 ? normalized : undefined;
}

/**
 * Returns a stable identity string for matching tracks:
 * - `isrc:<ISRC>` when ISRC exists
 * - otherwise `title:<TITLE>`
 *
 * This follows the project rule: "ISRC or track names if no ISRC is present".
 */
export function getPreferredTrackIdentity(input: {
  readonly isrc?: string | null;
  readonly title?: string | null;
}): string | undefined {
  const isrc = normalizeIsrc(input.isrc);
  if (isrc) return `isrc:${isrc}`;

  const title = normalizeTitle(input.title);
  if (title) return `title:${title}`;

  return undefined;
}

/**
 * Builds a stable in-memory key for album+disc+track lookup.
 * Matches the DB unique constraint: (albumId, discNumber, trackNumber).
 */
export function getAlbumDiscTrackKey(
  albumId: string,
  discNumber: number,
  trackNumber: number,
): string {
  return `${albumId}::d${discNumber}::t${trackNumber}`;
}

/**
 * Minimal snapshot of an existing track used for deciding update behavior.
 */
export interface ExistingTrackSnapshot {
  readonly name: string;
  readonly isrc?: string | null;
  readonly durationMs: number;
}

/**
 * Minimal snapshot of incoming track metadata extracted from tags/ffprobe.
 */
export interface IncomingTrackSnapshot {
  readonly title: string;
  readonly isrc?: string | null;
  readonly durationMs: number;
}

/**
 * Computes how to update a track according to Oktomusic rules:
 * - Always update durationMs if different.
 * - If incoming ISRC exists:
 *   - set it if existing ISRC is empty
 *   - do not overwrite if different (conflict)
 *   - allow updating name (since ISRC identifies the track)
 * - If incoming ISRC does not exist:
 *   - do not update name (title-based identity is weaker)
 */
export function getTrackUpdatePlan(
  existing: ExistingTrackSnapshot,
  incoming: IncomingTrackSnapshot,
): {
  readonly patch: {
    readonly name?: string;
    readonly isrc?: string;
    readonly durationMs?: number;
  };
  readonly hasIsrcConflict: boolean;
} {
  const patch: {
    name?: string;
    isrc?: string;
    durationMs?: number;
  } = {};

  const incomingIsrc = normalizeIsrc(incoming.isrc);
  const existingIsrc = normalizeIsrc(existing.isrc);

  let hasIsrcConflict = false;

  if (existing.durationMs !== incoming.durationMs) {
    patch.durationMs = incoming.durationMs;
  }

  if (incomingIsrc) {
    if (!existingIsrc) {
      patch.isrc = incomingIsrc;
    } else if (existingIsrc !== incomingIsrc) {
      hasIsrcConflict = true;
    }

    const incomingTitle = normalizeTitle(incoming.title);
    if (incomingTitle && incomingTitle !== existing.name) {
      patch.name = incomingTitle;
    }
  }

  return { patch, hasIsrcConflict };
}
