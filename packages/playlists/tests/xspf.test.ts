import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { JspfPlaylist } from "../src/jspf";
import { parseJspf } from "../src/jspf";
import { generateXspf, parseXspf } from "../src/xspf";

const simplePath = resolve(__dirname, "./files/playlist-simple.xspf");
const simpleFixture = readFileSync(simplePath, "utf8").trim();

const fullPath = resolve(__dirname, "./files/playlist-full.xspf");
const fullFixture = readFileSync(fullPath, "utf8").trim();

const playlistPath = resolve(__dirname, "./files/playlist.xspf");
const playlistFixture = readFileSync(playlistPath, "utf8").trim();

const simpleParsed: JspfPlaylist = {
  playlist: {
    track: [
      { location: ["file:///music/song_1.ogg"] },
      { location: ["file:///music/song_2.flac"] },
      { location: ["file:///music/song_3.mp3"] },
    ],
  },
};

const fullParsed: JspfPlaylist = {
  playlist: {
    title: "XSPF example",
    creator: "Name of playlist author",
    annotation: "Super playlist",
    info: "http://example.com/",
    location: "http://example.com/",
    identifier: "http://example.com/",
    image: "http://example.com/",
    date: "2005-01-08T17:10:47-05:00",
    license: "http://example.com/",
    attribution: [
      { identifier: "http://example.com/" },
      { location: "http://example.com/" },
    ],
    link: [
      { "http://example.com/rel/1/": "http://example.com/body/1/" },
      { "http://example.com/rel/2/": "http://example.com/body/2/" },
    ],
    meta: [
      { "http://example.com/rel/1/": "my meta 14" },
      { "http://example.com/rel/2/": "345" },
    ],
    track: [
      {
        location: ["http://example.com/1.ogg", "http://example.com/2.mp3"],
        identifier: ["http://example.com/1/", "http://example.com/2/"],
        title: "Track title",
        creator: "Artist name",
        annotation: "Some text",
        info: "http://example.com/",
        image: "http://example.com/",
        album: "Album name",
        trackNum: 1,
        duration: 0,
        link: [
          { "http://example.com/rel/1/": "http://example.com/body/1/" },
          { "http://example.com/rel/2/": "http://example.com/body/2/" },
        ],
        meta: [
          { "http://example.com/rel/1/": "my meta 14" },
          { "http://example.com/rel/2/": "345" },
        ],
      },
    ],
  },
};

describe("XSPF parser", () => {
  it("parses the simple XSPF fixture", () => {
    expect(parseXspf(simpleFixture)).toEqual(simpleParsed);
  });

  it("parses the playlist.xspf fixture", () => {
    const result = parseXspf(playlistFixture);
    expect(result.playlist.title).toBe("My Playlist");
    expect(result.playlist.track).toHaveLength(2);
    expect(result.playlist.track?.[0]?.title).toBe("Phoenix");
    expect(result.playlist.track?.[0]?.duration).toBe(238000);
    expect(result.playlist.track?.[0]?.location).toEqual([
      "Netrum - Phoenix (2021)/1. Netrum - Phoenix.flac",
    ]);
    expect(result.playlist.track?.[1]?.title).toBe("Backstreet Boy");
  });

  it("parses the full XSPF fixture", () => {
    const result = parseXspf(fullFixture);
    expect(result.playlist.title).toBe("XSPF example");
    expect(result.playlist.creator).toBe("Name of playlist author");
    expect(result.playlist.annotation).toBe("Super playlist");
    expect(result.playlist.info).toBe("http://example.com/");
    expect(result.playlist.location).toBe("http://example.com/");
    expect(result.playlist.identifier).toBe("http://example.com/");
    expect(result.playlist.image).toBe("http://example.com/");
    expect(result.playlist.date).toBe("2005-01-08T17:10:47-05:00");
    expect(result.playlist.license).toBe("http://example.com/");
    expect(result.playlist.link).toHaveLength(2);
    expect(result.playlist.meta).toHaveLength(2);

    const track = result.playlist.track?.[0];
    expect(track?.location).toEqual([
      "http://example.com/1.ogg",
      "http://example.com/2.mp3",
    ]);
    expect(track?.identifier).toEqual([
      "http://example.com/1/",
      "http://example.com/2/",
    ]);
    expect(track?.title).toBe("Track title");
    expect(track?.creator).toBe("Artist name");
    expect(track?.album).toBe("Album name");
    expect(track?.trackNum).toBe(1);
    expect(track?.duration).toBe(0);
    expect(track?.link).toHaveLength(2);
    expect(track?.meta).toHaveLength(2);
  });

  it("parses link and meta attributes correctly", () => {
    const result = parseXspf(fullFixture);
    expect(result.playlist.link?.[0]).toEqual({
      "http://example.com/rel/1/": "http://example.com/body/1/",
    });
    expect(result.playlist.meta?.[1]).toEqual({
      "http://example.com/rel/2/": "345",
    });
  });

  it("parses a minimal XSPF with only trackList", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<playlist version="1" xmlns="http://xspf.org/ns/0/">
  <trackList>
    <track><location>http://example.com/song.mp3</location></track>
  </trackList>
</playlist>`;
    const result = parseXspf(xml);
    expect(result.playlist.track?.[0]?.location).toEqual([
      "http://example.com/song.mp3",
    ]);
  });

  it("parses an empty trackList", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<playlist version="1" xmlns="http://xspf.org/ns/0/">
  <trackList/>
</playlist>`;
    const result = parseXspf(xml);
    expect(result.playlist.track).toBeUndefined();
  });

  it("throws when the playlist root element is missing", () => {
    expect(() => parseXspf("<root/>")).toThrow(
      "Invalid XSPF: missing <playlist> root element",
    );
  });

  it("handles XML special characters in content", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<playlist version="1" xmlns="http://xspf.org/ns/0/">
  <title>Artist &amp; Title &lt;Special&gt;</title>
  <trackList/>
</playlist>`;
    const result = parseXspf(xml);
    expect(result.playlist.title).toBe("Artist & Title <Special>");
  });
});

describe("XSPF generator", () => {
  it("generates XML with the XSPF namespace and version", () => {
    const xml = generateXspf({ playlist: {} });
    expect(xml).toContain('xmlns="http://xspf.org/ns/0/"');
    expect(xml).toContain('version="1"');
  });

  it("generates a trackList element even when there are no tracks", () => {
    const xml = generateXspf({ playlist: {} });
    expect(xml).toContain("<trackList>");
    expect(xml).toContain("</trackList>");
  });

  it("generates the expected output for the simple fixture playlist", () => {
    const xml = generateXspf(simpleParsed);
    const reparsed = parseXspf(xml);
    expect(reparsed).toEqual(simpleParsed);
  });

  it("round-trips the full fixture playlist", () => {
    const reparsed = parseXspf(generateXspf(fullParsed));
    expect(reparsed).toEqual(fullParsed);
  });

  it("generates location elements for each location URI", () => {
    const playlist: JspfPlaylist = {
      playlist: {
        track: [
          {
            location: [
              "http://example.com/alt1.ogg",
              "http://example.com/alt2.mp3",
            ],
            title: "Multi-location Track",
          },
        ],
      },
    };
    const xml = generateXspf(playlist);
    expect(xml).toContain("<location>http://example.com/alt1.ogg</location>");
    expect(xml).toContain("<location>http://example.com/alt2.mp3</location>");
  });

  it("generates link and meta elements with rel attributes", () => {
    const playlist: JspfPlaylist = {
      playlist: {
        link: [{ "http://example.com/rel/": "http://example.com/val/" }],
        meta: [{ "http://example.com/key/": "some value" }],
        track: [],
      },
    };
    const xml = generateXspf(playlist);
    expect(xml).toContain(
      '<link rel="http://example.com/rel/">http://example.com/val/</link>',
    );
    expect(xml).toContain(
      '<meta rel="http://example.com/key/">some value</meta>',
    );
  });

  it("generates attribution elements", () => {
    const playlist: JspfPlaylist = {
      playlist: {
        attribution: [
          { location: "http://example.com/original.xspf" },
          { identifier: "urn:example:playlist:1" },
        ],
        track: [],
      },
    };
    const xml = generateXspf(playlist);
    expect(xml).toContain("<attribution>");
    expect(xml).toContain(
      "<location>http://example.com/original.xspf</location>",
    );
    expect(xml).toContain("<identifier>urn:example:playlist:1</identifier>");
  });

  it("escapes XML special characters in text content", () => {
    const playlist: JspfPlaylist = {
      playlist: {
        title: "Rock & Roll <Greatest Hits>",
        track: [],
      },
    };
    const xml = generateXspf(playlist);
    expect(xml).toContain(
      "<title>Rock &amp; Roll &lt;Greatest Hits&gt;</title>",
    );
  });

  it("generates all track fields", () => {
    const xml = generateXspf(fullParsed);
    const track = fullParsed.playlist.track?.[0];
    expect(xml).toContain(`<title>${track?.title}</title>`);
    expect(xml).toContain(`<creator>${track?.creator}</creator>`);
    expect(xml).toContain(`<album>${track?.album}</album>`);
    expect(xml).toContain(`<trackNum>${track?.trackNum}</trackNum>`);
    expect(xml).toContain(`<duration>${track?.duration}</duration>`);
  });

  it("round-trips parsed XSPF back to XSPF", () => {
    const parsed = parseXspf(simpleFixture);
    const generated = generateXspf(parsed);
    const reparsed = parseXspf(generated);
    expect(reparsed).toEqual(parsed);
  });
});

describe("XSPF and JSPF interoperability", () => {
  it("can convert a JSPF fixture to XSPF and back", () => {
    const jspfContent = readFileSync(
      resolve(__dirname, "./files/playlist-full.jspf"),
      "utf8",
    );
    const jspfPlaylist = parseJspf(jspfContent);
    const xspf = generateXspf(jspfPlaylist);
    const roundTripped = parseXspf(xspf);

    // Core fields should match
    expect(roundTripped.playlist.title).toBe(jspfPlaylist.playlist.title);
    expect(roundTripped.playlist.creator).toBe(jspfPlaylist.playlist.creator);
    expect(roundTripped.playlist.track?.[0]?.title).toBe(
      jspfPlaylist.playlist.track?.[0]?.title,
    );
    expect(roundTripped.playlist.track?.[0]?.duration).toBe(
      jspfPlaylist.playlist.track?.[0]?.duration,
    );
  });
});
