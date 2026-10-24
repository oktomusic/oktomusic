import { atom } from "jotai";

export const batteryPercentageAtom = atom<number | null>(null);
export const batteryChargingAtom = atom<boolean | null>(null);
