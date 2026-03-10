import { atom } from "jotai";

export const dialogCoverId = atom<string | null>(null);

/**
 * Playlist dialog state
 * - false: dialog is closed
 * - true: dialog is open in create mode
 * - string (playlist ID): dialog is open in edit mode for that playlist
 */
export const dialogPlaylistOpenAtom = atom<boolean | string>(false);
