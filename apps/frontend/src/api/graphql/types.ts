import type { SearchMusicQuery, TrackLyricsQuery } from "./gql/graphql";

export type AlbumBasic = NonNullable<
  SearchMusicQuery["search"]["tracks"][number]["album"]
>;

export type Artist = SearchMusicQuery["search"]["artists"][number];

export type PlaylistBasic = SearchMusicQuery["search"]["playlists"][number];

export type LyricsLine = NonNullable<
  TrackLyricsQuery["track"]["lyrics"]
>[number];

export type LyricsChunk = LyricsLine["l"][number];
