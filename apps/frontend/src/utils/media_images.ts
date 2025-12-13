type MediaImage = NonNullable<
  typeof navigator.mediaSession.metadata
>["artwork"][number];

// https://developer.mozilla.org/en-US/docs/Web/API/MediaMetadata/artwork
export const albumCoverSizes = [96, 128, 192, 256, 384, 512, 1280] as const;

/**
 * Return an array of MediaImage objects for the given album UUID, for use with the MediaMetadata API.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaMetadata/artwork
 */
export function getMediaImages(uuid: string): MediaImage[] {
  return albumCoverSizes.map((size) => ({
    src: `/api/album/${uuid}/cover/${size}`,
    sizes: `${size}x${size}`,
    type: "image/avif",
  }));
}
