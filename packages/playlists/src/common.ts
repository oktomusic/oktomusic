export interface ExtPlaylistItem {
  readonly title: string;
  /**
   * Duration in milliseconds
   */
  readonly durationMs: number;
  /**
   * File path relative to the library root
   *
   * @example "Album/Artist - Title.flac"
   */
  readonly file: string;
}

export interface ExtPlaylist {
  readonly name: string;
  readonly items: readonly ExtPlaylistItem[];
}
