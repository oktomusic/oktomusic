import type { ExtPlaylist, ExtPlaylistItem } from "./common";

export function playlistToM3U(playlist: ExtPlaylist): string {
  const lines = ["#EXTM3U"];

  for (const item of playlist.items) {
    lines.push(`#EXTINF:${Math.round(item.durationMs / 1000)},${item.title}`);
    lines.push(item.file);
  }

  return lines.join("\n");
}

export function m3uToPlaylist(m3u: string, name: string): ExtPlaylist {
  const lines = m3u
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0 || lines[0] !== "#EXTM3U") {
    throw new Error("Invalid M3U format: Missing #EXTM3U header");
  }

  const items: ExtPlaylistItem[] = [];
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
      items.push({ title, durationMs, file });
    } else {
      throw new Error(`Unexpected line in M3U file: ${lines[i]}`);
    }
  }

  return { name, items };
}
