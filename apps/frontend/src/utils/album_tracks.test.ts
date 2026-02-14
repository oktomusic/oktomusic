import { describe, expect, it } from "vitest";

import type { AlbumQuery } from "../api/graphql/gql/graphql";
import { mapTracksWithAlbum } from "./album_tracks";

describe("mapTracksWithAlbum", () => {
  const album: AlbumQuery["album"] = {
    __typename: "Album",
    id: "album-1",
    name: "Test Album",
    date: new Date("2026-02-01T00:00:00.000Z"),
    coverColorVibrant: "#111111",
    coverColorDarkVibrant: "#222222",
    coverColorLightVibrant: "#333333",
    coverColorMuted: "#444444",
    coverColorDarkMuted: "#555555",
    coverColorLightMuted: "#666666",
    artists: [
      {
        __typename: "Artist",
        id: "artist-1",
        name: "Artist One",
      },
    ],
    tracksByDisc: [
      [
        {
          __typename: "Track",
          id: "track-1",
          flacFileId: "flac-1",
          hasLyrics: false,
          name: "Track One",
          trackNumber: 1,
          discNumber: 1,
          durationMs: 180_000,
          artists: [
            {
              __typename: "Artist",
              id: "artist-1",
              name: "Artist One",
            },
          ],
        },
      ],
      [
        {
          __typename: "Track",
          id: "track-2",
          flacFileId: null,
          hasLyrics: true,
          name: "Track Two",
          trackNumber: 1,
          discNumber: 2,
          durationMs: 210_000,
          artists: [
            {
              __typename: "Artist",
              id: "artist-2",
              name: "Artist Two",
            },
          ],
        },
      ],
    ],
  };

  it("maps album metadata onto tracks", () => {
    const result = mapTracksWithAlbum(album);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(1);
    expect(result[1]).toHaveLength(1);

    expect(result[0][0]).toMatchObject({
      id: "track-1",
      name: "Track One",
      albumId: "album-1",
      date: null,
      isrc: null,
      lyrics: null,
    });

    expect(result[0][0].album).toMatchObject({
      __typename: "AlbumBasic",
      id: "album-1",
      name: "Test Album",
      coverColorVibrant: "#111111",
    });

    expect("album" in album.tracksByDisc[0][0]).toBe(false);
  });

  it("reuses the same album metadata instance", () => {
    const result = mapTracksWithAlbum(album);

    expect(result[0][0].album).toBe(result[1][0].album);
  });
});
