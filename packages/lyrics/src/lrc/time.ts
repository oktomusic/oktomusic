// LRC time format: [mm:ss.xx] or <mm:ss.xx>
// mm = minutes (1-2 digits)
// ss = seconds (2 digits)
// xx = centiseconds or milliseconds (2-3 digits)

export function parseLrcTimeToMs(timeStr: string): number | undefined {
  if (!timeStr) return undefined

  // Remove brackets or angle brackets
  const cleaned = timeStr.replace(/[[\]<>]/g, "").trim()
  if (!cleaned) return undefined

  // Match mm:ss.xx format
  // Group 1: minutes (1-2 digits)
  // Group 2: seconds (2 digits)
  // Group 3: centiseconds/milliseconds (2-3 digits)
  const match = /^(\d{1,2}):(\d{2})\.(\d{2,3})$/.exec(cleaned)
  if (!match) return undefined

  const minutes = Number.parseInt(match[1], 10)
  const seconds = Number.parseInt(match[2], 10)
  const fraction = match[3]

  // Handle both centiseconds (2 digits) and milliseconds (3 digits)
  const ms =
    fraction.length === 2
      ? Number.parseInt(fraction, 10) * 10 // centiseconds to milliseconds
      : Number.parseInt(fraction, 10) // already milliseconds

  return minutes * 60_000 + seconds * 1000 + ms
}
