import { describe, expect, it } from "vitest"

import { parseTTMLtoLyrics } from "./ttml"

describe("parseTTMLtoLyrics", () => {
  it("parses a valid TTML file", () => {
    const input = `<?xml version="1.0" encoding="UTF-8"?>
<tt xmlns="http://www.w3.org/ns/ttml">
  <body>
    <div>
      <p begin="00:00:01.000" end="00:00:02.000">line1</p>
      <p begin="00:00:03.000" end="00:00:04.000">line2</p>
    </div>
  </body>
</tt>`

    const lyrics = parseTTMLtoLyrics(input)

    expect(lyrics).toHaveLength(2)
    expect(lyrics[0]?.t).toBe("line1")
    expect(lyrics[1]?.t).toBe("line2")
  })

  it("throws on malformed TTML XML (no partial output)", () => {
    const input = `<?xml version="1.0" encoding="UTF-8"?>
<tt xmlns="http://www.w3.org/ns/ttml">
  <body>
    <div>
      <p begin="00:00:01.000" end="00:00:02.000">line1</p>
      <p begin="00:00:03.000" end="00:00:04.000">line2</div>
  </body>
</tt>`

    // With `parser.parse(input, true)`, fast-xml-parser performs validation and throws.
    // Error message format is library-controlled, so we only assert it throws.
    expect(() => parseTTMLtoLyrics(input)).toThrow()
  })
})
