export function getCoverAlbumIds(
  albumIds: readonly (string | null | undefined)[],
): string[] {
  const uniqueAlbumIds: string[] = [];

  for (const albumId of albumIds) {
    if (!albumId || uniqueAlbumIds.includes(albumId)) {
      continue;
    }

    uniqueAlbumIds.push(albumId);

    if (uniqueAlbumIds.length >= 4) {
      break;
    }
  }

  if (uniqueAlbumIds.length >= 4) {
    return uniqueAlbumIds.slice(0, 4);
  }

  return uniqueAlbumIds.length > 0 ? [uniqueAlbumIds[0]] : [];
}
