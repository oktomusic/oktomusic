import { atom } from "jotai";

export const pipOpenAtom = atom<boolean>(false);

export const pipSupportedAtom = atom<boolean>(() => {
  return !!window.documentPictureInPicture;
});
