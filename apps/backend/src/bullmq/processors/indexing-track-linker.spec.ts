import { describe, expect, it } from "vitest";

import {
  buildTrackLinksFromFiles,
  type IndexingFileData,
} from "./indexing.processor";

const buildFileData = (overrides: Partial<IndexingFileData>): IndexingFileData => {
  const base: IndexingFileData = {
    tags: {
      TITLE: "Track",
      ARTIST: ["Artist"],
      ALBUM: "Album",
      ALBUMARTIST: ["Artist"],
      TRACKNUMBER: 1,
      DISCNUMBER: 1,
      TOTALTRACKS: 2,
      TOTALDISCS: 1,
    },
    ffprobe: {
      sampleRate: 44100,
      bitsPerRawSample: 16,
      durationMs: 180000,
      fileSize: 1234,
      bitRate: 900000,
    },
    hash: "hash",
  };

  return {
    ...base,
    ...overrides,
    tags: {
      ...base.tags,
      ...(overrides.tags ?? {}),
    },
    ffprobe: {
      ...base.ffprobe,
      ...(overrides.ffprobe ?? {}),
    },
  };
};

describe("buildTrackLinksFromFiles", () => {
  it("returns sorted track links with relative paths and metadata", () => {
    const fileMap: Record<string, IndexingFileData> = {
      "/music/Album/02 - Second.flac": buildFileData({
        tags: {
          TRACKNUMBER: 2,
          TITLE: "Second",
        },
      }),
      "/music/Album/01 - First.flac": buildFileData({
        tags: {
          TRACKNUMBER: 1,
          TITLE: "First",
          ISRC: "US-AAA-24-12345",
        },
      }),
    };

    const links = buildTrackLinksFromFiles("/music", fileMap);

    expect(links.map((link) => link.track.trackNumber)).toEqual([1, 2]);
    expect(links[0].source.relativePath).toBe("Album/01 - First.flac");
    expect(links[1].track.title).toBe("Second");
    expect(links[0].track.isrc).toBe("US-AAA-24-12345");
    expect(links[0].source.sampleRate).toBe(44100);
  });
});
