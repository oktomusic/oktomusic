import { atom } from "jotai";

import type { MeQuery } from "../../api/graphql/gql/graphql.ts";

export type AuthSessionState =
  | { readonly status: "unknown"; readonly user: null }
  | {
      readonly status: "authenticated";
      readonly user: NonNullable<MeQuery["me"]>;
    }
  | { readonly status: "unauthenticated"; readonly user: null };

/**
 * Atom to store the current authentication session
 */
export const authSessionAtom = atom<AuthSessionState>({
  status: "unknown",
  user: null,
});
