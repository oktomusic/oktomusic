import { Temporal } from "temporal-polyfill";

/**
 * Minimal track information required to build a stable per-album track signature.
 */
export interface TrackKeySource {
  readonly discNumber: number;
  readonly trackNumber: number;
  readonly isrc?: string | null;
  readonly title: string;
}

export interface AlbumFilesMetadataValidationSource {
  readonly tags: {
    readonly ALBUM: string;
    readonly ALBUMARTIST: readonly string[];
    readonly DISCNUMBER: number;
    readonly TRACKNUMBER: number;
    readonly TOTALTRACKS: number;
    readonly TOTALDISCS: number;
  };
}

function formatNumbers(values: Iterable<number>): string {
  return [...values].toSorted((a, b) => a - b).join(", ");
}

function getOnlyValue(values: Set<number>): number | undefined {
  if (values.size !== 1) return undefined;
  for (const value of values) {
    return value;
  }
  return undefined;
}

function formatDiscTrackPair(discNumber: number, trackNumber: number): string {
  return `d${discNumber}t${trackNumber}`;
}

export function validateAlbumFilesMetadata(
  files: readonly AlbumFilesMetadataValidationSource[],
): string[] {
  const metadataIssues: string[] = [];
  if (files.length === 0) return metadataIssues;

  // 1. Album identity must be the same for every file in the folder.
  const albumSet = new Set(files.map((f) => f.tags.ALBUM));
  if (albumSet.size > 1) {
    metadataIssues.push(
      `Inconsistent ALBUM values: ${[...albumSet].join(", ")}`,
    );
  }

  const albumArtistSet = new Set(
    files.map((f) => JSON.stringify(f.tags.ALBUMARTIST)),
  );
  if (albumArtistSet.size > 1) {
    metadataIssues.push(
      `Inconsistent ALBUMARTIST values: ${[...albumArtistSet].join(", ")}`,
    );
  }

  // 2. Total disc count must be shared by every file and match the folder shape.
  const totalDiscsSet = new Set(files.map((f) => f.tags.TOTALDISCS));
  if (totalDiscsSet.size > 1) {
    metadataIssues.push(
      `Inconsistent TOTALDISCS values: ${formatNumbers(totalDiscsSet)}`,
    );
  } else {
    const totalDiscs = getOnlyValue(totalDiscsSet);
    const maxDiscNumber = Math.max(...files.map((f) => f.tags.DISCNUMBER));
    if (totalDiscs !== undefined && totalDiscs !== maxDiscNumber) {
      metadataIssues.push(
        `TOTALDISCS (${totalDiscs}) does not match the highest DISCNUMBER (${maxDiscNumber})`,
      );
    }
  }

  const discTrackCounts = new Map<string, number>();
  const trackDataByDisc = new Map<
    number,
    {
      readonly totalTracks: Set<number>;
      readonly trackNumbers: number[];
    }
  >();

  // 3. Collect per-position and per-disc data used by the remaining checks.
  for (const file of files) {
    const { DISCNUMBER, TRACKNUMBER, TOTALTRACKS } = file.tags;
    const discTrackKey = formatDiscTrackPair(DISCNUMBER, TRACKNUMBER);
    discTrackCounts.set(
      discTrackKey,
      (discTrackCounts.get(discTrackKey) ?? 0) + 1,
    );

    const discData = trackDataByDisc.get(DISCNUMBER) ?? {
      totalTracks: new Set<number>(),
      trackNumbers: [],
    };
    discData.totalTracks.add(TOTALTRACKS);
    discData.trackNumbers.push(TRACKNUMBER);
    trackDataByDisc.set(DISCNUMBER, discData);
  }

  // 4. A disc/track position can only be used by one file in the album.
  const duplicateDiscTrackPairs = [...discTrackCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([key]) => key)
    .sort();
  if (duplicateDiscTrackPairs.length > 0) {
    metadataIssues.push(
      `Duplicate DISCNUMBER + TRACKNUMBER pairs: ${duplicateDiscTrackPairs.join(", ")}`,
    );
  }

  const sortedDiscData = [...trackDataByDisc.entries()].toSorted(
    ([a], [b]) => a - b,
  );
  for (const [discNumber, discData] of sortedDiscData) {
    // 5. Track count is validated independently for each disc.
    if (discData.totalTracks.size > 1) {
      metadataIssues.push(
        `Inconsistent TOTALTRACKS values for DISCNUMBER ${discNumber}: ${formatNumbers(discData.totalTracks)}`,
      );
      continue;
    }

    const totalTracks = getOnlyValue(discData.totalTracks);
    if (totalTracks === undefined) continue;

    // 6. Track numbers must form a complete 1..TOTALTRACKS sequence.
    const uniqueTrackNumbers = new Set(discData.trackNumbers);
    if (uniqueTrackNumbers.size !== totalTracks) {
      metadataIssues.push(
        `DISCNUMBER ${discNumber} declares TOTALTRACKS=${totalTracks} but has ${uniqueTrackNumbers.size} unique track number(s)`,
      );
    }

    const missingTrackNumbers: number[] = [];
    for (let trackNumber = 1; trackNumber <= totalTracks; trackNumber += 1) {
      if (!uniqueTrackNumbers.has(trackNumber)) {
        missingTrackNumbers.push(trackNumber);
      }
    }

    if (missingTrackNumbers.length > 0) {
      metadataIssues.push(
        `DISCNUMBER ${discNumber} is missing TRACKNUMBER values: ${missingTrackNumbers.join(", ")}`,
      );
    }

    const outOfRangeTrackNumbers = [...uniqueTrackNumbers]
      .filter((trackNumber) => trackNumber < 1 || trackNumber > totalTracks)
      .toSorted((a, b) => a - b);
    if (outOfRangeTrackNumbers.length > 0) {
      metadataIssues.push(
        `DISCNUMBER ${discNumber} has TRACKNUMBER values outside 1..${totalTracks}: ${outOfRangeTrackNumbers.join(", ")}`,
      );
    }
  }

  return metadataIssues;
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
  const ordered = tracks.toSorted((a, b) =>
    a.discNumber !== b.discNumber
      ? a.discNumber - b.discNumber
      : a.trackNumber - b.trackNumber,
  );

  return ordered.map(getTrackKey);
}

function earliestPlainDate(
  dates: readonly Temporal.PlainDate[],
): Temporal.PlainDate {
  return dates.reduce((earliest, next) =>
    Temporal.PlainDate.compare(next, earliest) < 0 ? next : earliest,
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
  trackDates: ReadonlyArray<Temporal.PlainDate | null | undefined>,
): Temporal.PlainDate | null {
  const totalTracks = trackDates.length;
  if (totalTracks === 0) return null;

  const counts = new Map<
    string,
    { readonly date: Temporal.PlainDate; count: number }
  >();

  for (const d of trackDates) {
    if (!d) continue;
    const key = d.toString();
    const current = counts.get(key);
    if (current) {
      current.count += 1;
    } else {
      counts.set(key, { date: d, count: 1 });
    }
  }

  const distinctDates = [...counts.values()];
  if (distinctDates.length === 0) return null;

  const majorityThreshold = Math.floor(totalTracks / 2) + 1;
  const majorityDates = distinctDates
    .filter((x) => x.count >= majorityThreshold)
    .map((x) => x.date);

  if (majorityDates.length > 0) {
    return earliestPlainDate(majorityDates);
  }

  const repeatedDates = distinctDates
    .filter((x) => x.count > 1)
    .map((x) => x.date);

  if (repeatedDates.length > 0) {
    return earliestPlainDate(repeatedDates);
  }

  return earliestPlainDate(distinctDates.map((x) => x.date));
}
