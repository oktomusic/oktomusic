import type { JspfPlaylist } from "../src/jspf"

export const playlistM3U = {
  playlist: {
    title: "My Playlist",
    track: [
      {
        title: "Phoenix",
        duration: 238000,
        location: ["Netrum - Phoenix (2021)/1. Netrum - Phoenix.flac"],
      },
      {
        title: "Backstreet Boy",
        duration: 208000,
        location: [
          "Netrum - Backstreet Boy (2024)/1. Netrum - Backstreet Boy.flac",
        ],
      },
    ],
  },
} as const satisfies JspfPlaylist
