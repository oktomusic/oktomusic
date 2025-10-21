import { atom } from "jotai";

export const networkStatusAtom = atom<boolean>(
  typeof navigator !== "undefined" ? navigator.onLine : true,
);
