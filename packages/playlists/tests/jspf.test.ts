import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

import { generateJspf, parseJspf } from "../src/jspf"
import type { JspfPlaylist } from "../src/jspf"

const simplePath = resolve(__dirname, "./files/playlist-simple.jspf")
const simpleFixture = readFileSync(simplePath, "utf8").trim()

const fullPath = resolve(__dirname, "./files/playlist-full.jspf")
const fullFixture = readFileSync(fullPath, "utf8").trim()

const simpleParsed: JspfPlaylist = {
  playlist: {
    title: "Two Songs From Thriller",
    creator: "MJ Fan",
    track: [
      {
        location: ["http://example.com/billiejean.mp3"],
        title: "Billie Jean",
        creator: "Michael Jackson",
        album: "Thriller",
      },
      {
        location: ["http://example.com/thegirlismine.mp3"],
        title: "The Girl Is Mine",
        creator: "Michael Jackson",
        album: "Thriller",
      },
    ],
  },
}

const fullParsed: JspfPlaylist = {
  playlist: {
    title: "JSPF example",
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
}

describe("JSPF parser", () => {
  it("parses the simple fixture", () => {
    expect(parseJspf(simpleFixture)).toEqual(simpleParsed)
  })

  it("parses the full fixture", () => {
    expect(parseJspf(fullFixture)).toEqual(fullParsed)
  })

  it("parses a playlist with an empty track list", () => {
    const input = JSON.stringify({ playlist: { title: "Empty", track: [] } })
    expect(parseJspf(input)).toEqual({ playlist: { title: "Empty", track: [] } })
  })

  it("parses a minimal playlist with no title", () => {
    const input = JSON.stringify({ playlist: {} })
    expect(parseJspf(input)).toEqual({ playlist: {} })
  })

  it("throws on invalid JSON", () => {
    expect(() => parseJspf("not json")).toThrow("Invalid JSPF: failed to parse JSON")
  })

  it("throws when the root playlist property is missing", () => {
    expect(() => parseJspf(JSON.stringify({}))).toThrow(
      "Invalid JSPF: schema validation failed",
    )
  })

  it("throws when trackNum is negative", () => {
    const input = JSON.stringify({
      playlist: {
        track: [{ trackNum: -1 }],
      },
    })
    expect(() => parseJspf(input)).toThrow("Invalid JSPF: schema validation failed")
  })

  it("throws when duration is negative", () => {
    const input = JSON.stringify({
      playlist: {
        track: [{ duration: -100 }],
      },
    })
    expect(() => parseJspf(input)).toThrow("Invalid JSPF: schema validation failed")
  })
})

describe("JSPF generator", () => {
  it("generates valid JSON that round-trips through the parser", () => {
    const json = generateJspf(simpleParsed)
    expect(parseJspf(json)).toEqual(simpleParsed)
  })

  it("generates valid JSON for the full example", () => {
    const json = generateJspf(fullParsed)
    expect(parseJspf(json)).toEqual(fullParsed)
  })

  it("generates pretty-printed JSON by default", () => {
    const json = generateJspf({ playlist: { title: "Test" } })
    expect(json).toContain("\n")
    expect(json).toContain("  ")
  })

  it("generates compact JSON when indent is 0", () => {
    const json = generateJspf({ playlist: { title: "Test" } }, 0)
    expect(json).not.toContain("\n")
  })

  it("round-trips the simple fixture", () => {
    const parsed = parseJspf(simpleFixture)
    const generated = generateJspf(parsed)
    expect(parseJspf(generated)).toEqual(parsed)
  })

  it("round-trips the full fixture", () => {
    const parsed = parseJspf(fullFixture)
    const generated = generateJspf(parsed)
    expect(parseJspf(generated)).toEqual(parsed)
  })
})

describe("JSPF schema validation", () => {
  it("accepts a track with all optional fields absent", () => {
    const input = JSON.stringify({ playlist: { track: [{}] } })
    expect(parseJspf(input)).toEqual({ playlist: { track: [{}] } })
  })

  it("accepts a track with all fields present", () => {
    const track = {
      location: ["http://example.com/track.mp3"],
      identifier: ["http://example.com/id/1"],
      title: "Song",
      creator: "Artist",
      annotation: "A note",
      info: "http://example.com/info",
      image: "http://example.com/cover.jpg",
      album: "Album",
      trackNum: 3,
      duration: 240000,
      link: [{ "http://example.com/rel/": "http://example.com/val/" }],
      meta: [{ "http://example.com/key/": "value" }],
    }
    const input = JSON.stringify({ playlist: { track: [track] } })
    expect(parseJspf(input)).toEqual({ playlist: { track: [track] } })
  })

  it("accepts a playlist with attribution items", () => {
    const input = JSON.stringify({
      playlist: {
        attribution: [
          { location: "http://example.com/original.jspf" },
          { identifier: "urn:example:playlist:1" },
        ],
      },
    })
    const result = parseJspf(input)
    expect(result.playlist.attribution).toHaveLength(2)
    expect(result.playlist.attribution?.[0]).toEqual({
      location: "http://example.com/original.jspf",
    })
  })

  it("accepts multiple link and meta items", () => {
    const input = JSON.stringify({
      playlist: {
        link: [
          { "http://example.com/rel/a/": "http://example.com/val/a/" },
          { "http://example.com/rel/b/": "http://example.com/val/b/" },
        ],
        meta: [{ "http://example.com/key/": "metadata value" }],
      },
    })
    const result = parseJspf(input)
    expect(result.playlist.link).toHaveLength(2)
    expect(result.playlist.meta).toHaveLength(1)
  })
})
