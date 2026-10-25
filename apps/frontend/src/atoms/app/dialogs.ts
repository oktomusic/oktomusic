import { atom } from "jotai";

import type { AlbumBasic, PlaylistBasic } from "../../api/graphql/types";
import type { VibrantColors } from "../player/machine";

export const dialogCoverId = atom<string | null>(null);

/**
 * Playlist create/edit dialog state
 * - false: dialog is closed
 * - true: dialog is open in create mode
 * - string (playlist ID): dialog is open in edit mode for that playlist
 */
export const dialogPlaylistOpenAtom = atom<boolean | string>(false);

/**
 * Playlist delete confirmation dialog state
 * - null: dialog is closed
 * - PlaylistBasic: dialog is open for the given playlist
 */
export const dialogPlaylistDeleteOpenAtom = atom<PlaylistBasic | null>(null);

interface AlbumPlaylistPrintDialogState {
  readonly subject: AlbumBasic | PlaylistBasic;
  readonly colors?: VibrantColors;
}

/**
 * Album/Playlist print dialog state
 * - null: dialog is closed
 * - AlbumPlaylistPrintDialogState: dialog is open with the selected subject and its colors
 */
export const dialogAlbumPlaylistPrintAtom =
  atom<AlbumPlaylistPrintDialogState | null>(null);
