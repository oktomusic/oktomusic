import type { ExtPlaylist } from "../src/common";

export const playlistM3U = {
  name: "My Playlist",
  items: [
    {
      title: "Phoenix",
      durationMs: 238000,
      file: "Netrum - Phoenix (2021)/1. Netrum - Phoenix.flac",
    },
    {
      title: "Backstreet Boy",
      durationMs: 208000,
      file: "Netrum - Backstreet Boy (2024)/1. Netrum - Backstreet Boy.flac",
    },
  ],
} as const satisfies ExtPlaylist;
