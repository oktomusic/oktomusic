import { atom } from "jotai";

export const playerAudioContextAtom = atom<AudioContext | null>(null);

// Currently only webaudio is supported
// We plan to allow remote control via SocketIO
export const engineAtom = atom<"webaudio">("webaudio");
