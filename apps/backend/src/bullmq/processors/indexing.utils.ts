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
