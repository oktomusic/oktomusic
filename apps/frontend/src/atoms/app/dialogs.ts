import { atom } from "jotai";

import { PlaylistBasic } from "../../api/graphql/gql/graphql";

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
