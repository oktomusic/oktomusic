import { atom } from "jotai";

import type { MeQuery } from "../../api/graphql/gql/graphql.ts";

export type AuthSessionState =
  | { status: "unknown"; user: null }
  | { status: "authenticated"; user: NonNullable<MeQuery["me"]> }
  | { status: "unauthenticated"; user: null };

/**
 * Atom to store the current authentication session
 */
export const authSessionAtom = atom<AuthSessionState>({
  status: "unknown",
  user: null,
});

/**
 * Atom to track if we're currently refreshing the token
 */
export const isRefreshingAtom = atom(false);
