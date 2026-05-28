type CoverAlbumIds =
  | readonly [string]
  | readonly [string, string, string, string];

export type CoverImages = CoverAlbumIds | string;

export function getCoverImagesFromAlbumIds(
  albumIds: readonly string[],
  fallback: string,
): CoverImages {
  if (albumIds.length >= 4) {
    return [albumIds[0], albumIds[1], albumIds[2], albumIds[3]] as const;
  }

  if (albumIds.length >= 1) {
    return [albumIds[0]] as const;
  }

  return fallback;
}
