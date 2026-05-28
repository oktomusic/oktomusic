export const albumCoverSizes = [96, 128, 192, 256, 384, 512, 1280] as const;

export type AlbumCoverSize = (typeof albumCoverSizes)[number];
