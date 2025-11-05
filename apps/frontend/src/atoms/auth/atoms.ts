import { atom } from "jotai";

import type { AuthSessionRes } from "@oktomusic/api-schemas";

/**
 * Atom to store the current authentication session
 */
export const authSessionAtom = atom<AuthSessionRes>({ authenticated: false });

/**
 * Atom to track if we're currently refreshing the token
 */
export const isRefreshingAtom = atom(false);
