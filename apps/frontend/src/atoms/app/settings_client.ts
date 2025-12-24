import { atomWithStorage, createJSONStorage } from "jotai/utils";

const kioskModeLocalStorageKey = "oktomusic:kiosk_mode";

const kioskModeStorage = createJSONStorage<boolean>(() => window.localStorage);

export const settingClientKioskMode = atomWithStorage<boolean>(
  kioskModeLocalStorageKey,
  false,
  kioskModeStorage,
  {
    getOnInit: true,
  },
);
