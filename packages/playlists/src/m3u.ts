import type { JspfPlaylist, JspfTrack } from "./jspf";

export function generateM3U(playlist: JspfPlaylist): string {
  const lines = ["#EXTM3U"];

  for (const track of playlist.playlist.track ?? []) {
    const durationSec = Math.round((track.duration ?? 0) / 1000);
    const title = track.title ?? "";
    const file = track.location?.[0] ?? "";
    lines.push(`#EXTINF:${durationSec},${title}`);
    lines.push(file);
  }

  return lines.join("\n");
}

export function parseM3U(m3u: string, name: string): JspfPlaylist {
  const lines = m3u
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0 || lines[0] !== "#EXTM3U") {
    throw new Error("Invalid M3U format: Missing #EXTM3U header");
  }

  const tracks: JspfTrack[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF:")) {
      const match = lines[i].match(/^#EXTINF:(\d+),(.*)$/);
      if (!match) {
        throw new Error(`Invalid EXTINF line: ${lines[i]}`);
      }
      const durationMs = parseInt(match[1], 10) * 1000;
      const title = match[2];
      i++;
      if (i >= lines.length) {
        throw new Error("Unexpected end of M3U file after EXTINF line");
      }
      const file = lines[i];
      tracks.push({ title, duration: durationMs, location: [file] });
    } else {
      throw new Error(`Unexpected line in M3U file: ${lines[i]}`);
    }
  }

  return { playlist: { title: name, track: tracks } };
}
