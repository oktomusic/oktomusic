type MediaImage = NonNullable<
  typeof navigator.mediaSession.metadata
>["artwork"][number];

// https://developer.mozilla.org/en-US/docs/Web/API/MediaMetadata/artwork
export const albumCoverSizes = [96, 128, 192, 256, 384, 512, 1280] as const;

export function getMediaImages(uuid: string): MediaImage[] {
  return albumCoverSizes.map((size) => ({
    src: `/api/media/${uuid}/cover/${size}`,
    sizes: `${size}x${size}`,
    type: "image/avif",
  }));
}
