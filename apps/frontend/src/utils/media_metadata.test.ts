import { describe, expect, it, vi } from "vitest";

import { buildMediaMetadata } from "./media_metadata";
import { getMediaImages } from "./media_images";
import { TrackWithAlbum } from "../atoms/player/machine";

vi.mock("./media_images", () => {
  return {
    getMediaImages: vi.fn(),
  };
});

class MediaMetadataMock {
  public readonly title: string;
  public readonly artist: string;
  public readonly album: string;
  public readonly artwork: unknown;

  public constructor(init: {
    readonly title: string;
    readonly artist: string;
    readonly album: string;
    readonly artwork: unknown;
  }) {
    this.title = init.title;
    this.artist = init.artist;
    this.album = init.album;
    this.artwork = init.artwork;
  }
}

describe("buildMediaMetadata", () => {
  it("builds MediaMetadata from the track and album", () => {
    vi.stubGlobal("MediaMetadata", MediaMetadataMock);

    const artwork = [
      { src: "/cover.avif", sizes: "96x96", type: "image/avif" },
    ];
    vi.mocked(getMediaImages).mockReturnValue(artwork);

    const track: TrackWithAlbum = {
      id: "track_123",
      name: "Song A",
      hasLyrics: false,
      artists: [
        { id: "artist_1", name: "Artist A" },
        { id: "artist_2", name: "Artist B" },
      ],
      album: { id: "alb_123", name: "Album A", artists: [] },
      discNumber: 1,
      trackNumber: 1,
      durationMs: 210_000,
    };
    const metadata = buildMediaMetadata(track);

    expect(getMediaImages).toHaveBeenCalledTimes(1);
    expect(getMediaImages).toHaveBeenCalledWith("alb_123");

    expect(metadata).toBeInstanceOf(MediaMetadataMock);
    expect((metadata as unknown as MediaMetadataMock).title).toBe("Song A");
    expect((metadata as unknown as MediaMetadataMock).artist).toBe("Artist A");
    expect((metadata as unknown as MediaMetadataMock).album).toBe("Album A");
    expect((metadata as unknown as MediaMetadataMock).artwork).toBe(artwork);
  });

  it("uses 'Unknown' artist when track has no artist", () => {
    vi.stubGlobal("MediaMetadata", MediaMetadataMock);

    vi.mocked(getMediaImages).mockReturnValue([] as never);

    const track = {
      name: "Song B",
      artists: [],
      album: { id: "alb_999", name: "Album B" },
    } as never;

    const metadata = buildMediaMetadata(track);

    expect((metadata as unknown as MediaMetadataMock).artist).toBe("Unknown");
  });
});
