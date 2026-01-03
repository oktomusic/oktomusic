/**
 * Minimal track information required to build a stable per-album track signature.
 */
export interface TrackKeySource {
  readonly discNumber: number;
  readonly trackNumber: number;
  readonly isrc?: string | null;
  readonly title: string;
}

/**
 * Builds a stable album signature used for matching folders/albums.
 *
 * Notes:
 * - `albumArtists` order matters.
 * - `trackKeys` should be ordered by disc/track.
 */
export function getAlbumSignature(
  albumName: string,
  albumArtists: readonly string[],
  trackCounts: readonly number[],
  trackKeys: readonly string[],
): string {
  return JSON.stringify({
    album: albumName,
    artists: albumArtists,
    trackCounts: [...trackCounts],
    trackKeys: [...trackKeys],
  });
}

/**
 * Returns the number of tracks per disc, with missing discs filled with 0.
 *
 * Example: disc 1 has 2 tracks and disc 3 has 1 track => [2, 0, 1]
 */
export function getTrackCountsPerDisc(
  tracks: readonly { readonly discNumber: number }[],
): number[] {
  if (tracks.length === 0) return [];

  const countsByDisc = new Map<number, number>();
  for (const track of tracks) {
    countsByDisc.set(
      track.discNumber,
      (countsByDisc.get(track.discNumber) ?? 0) + 1,
    );
  }

  const maxDisc = Math.max(...countsByDisc.keys());
  const trackCounts: number[] = [];
  for (let disc = 1; disc <= maxDisc; disc += 1) {
    trackCounts.push(countsByDisc.get(disc) ?? 0);
  }

  return trackCounts;
}

/**
 * Returns a stable per-track key used inside an album signature.
 *
 * Prefers ISRC when present (uppercased) and falls back to title otherwise.
 */
export function getTrackKey(source: TrackKeySource): string {
  const isrc = source.isrc?.trim();
  const key =
    typeof isrc === "string" && isrc.length > 0
      ? `isrc:${isrc.toUpperCase()}`
      : `title:${source.title.trim()}`;

  return `d${source.discNumber}t${source.trackNumber}:${key}`;
}

/**
 * Returns `getTrackKey()` for all tracks ordered by (discNumber, trackNumber).
 */
export function getOrderedTrackKeys(
  tracks: readonly TrackKeySource[],
): string[] {
  const ordered = [...tracks].sort((a, b) =>
    a.discNumber !== b.discNumber
      ? a.discNumber - b.discNumber
      : a.trackNumber - b.trackNumber,
  );

  return ordered.map(getTrackKey);
}

/**
 * Builds a stable YYYY-MM-DD key from a Date, using UTC.
 */
function dateKeyUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Normalizes a Date into a UTC date-only value (midnight UTC).
 *
 * This helps treat track dates as day-level data and avoids time/timezone drift
 * when comparing and counting dates across tracks.
 */
function normalizeToUtcDateOnly(date: Date): Date {
  const key = dateKeyUtc(date);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return date;

  const [, year, month, day] = match;
  return new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0),
  );
}

/**
 * Picks an album date from per-track dates.
 *
 * Rules:
 * - Take the earliest date that appears on a majority of tracks.
 * - If no majority exists: take the earliest date that appears on more than one track.
 * - If all dates are unique: take the earliest date overall.
 * - If no date is present on tracks: return null.
 */
export function pickAlbumDateFromTrackDates(
  trackDates: ReadonlyArray<Date | null | undefined>,
): Date | null {
  const totalTracks = trackDates.length;
  if (totalTracks === 0) return null;

  const counts = new Map<string, { readonly date: Date; count: number }>();

  for (const d of trackDates) {
    if (!d) continue;
    const normalized = normalizeToUtcDateOnly(d);
    const key = dateKeyUtc(normalized);
    const current = counts.get(key);
    if (current) {
      current.count += 1;
    } else {
      counts.set(key, { date: normalized, count: 1 });
    }
  }

  const distinctDates = Array.from(counts.values());
  if (distinctDates.length === 0) return null;

  const majorityThreshold = Math.floor(totalTracks / 2) + 1;
  const majorityDates = distinctDates
    .filter((x) => x.count >= majorityThreshold)
    .map((x) => x.date);

  if (majorityDates.length > 0) {
    return majorityDates.reduce((earliest, next) =>
      next.getTime() < earliest.getTime() ? next : earliest,
    );
  }

  const repeatedDates = distinctDates
    .filter((x) => x.count > 1)
    .map((x) => x.date);

  if (repeatedDates.length > 0) {
    return repeatedDates.reduce((earliest, next) =>
      next.getTime() < earliest.getTime() ? next : earliest,
    );
  }

  return distinctDates
    .map((x) => x.date)
    .reduce((earliest, next) =>
      next.getTime() < earliest.getTime() ? next : earliest,
    );
}
