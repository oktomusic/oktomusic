import { atom } from "jotai";

export const networkStatusAtom = atom<boolean>(
  typeof navigator !== "undefined" ? navigator.onLine : true,
);

/**
 * Indicates whether persistent storage has been granted.
 *
 * - `true`  -> persistent storage granted
 * - `false` -> denied
 * - `null`  -> unknown / not checked yet
 *
 * Sadly Chrome is the "bad" browser here, as it grants persistent storage based on user context, no direct user popup like Firefox.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/StorageManager
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria#does_browser-stored_data_persist
 */
export const storagePersistenceAtom = atom<boolean | null>(null);

export const requestStoragePersistenceAtom = atom(null, async (_get, set) => {
  try {
    const granted = await navigator.storage.persist();
    if (granted) {
      console.log("Persistent storage granted");
    } else {
      console.log("Persistent storage denied");
      alert("Persistent storage request was denied"); // TODO: toast notification
    }
    set(storagePersistenceAtom, granted);
  } catch {
    set(storagePersistenceAtom, false);
  }
});

/**
 * Holds the defered PWA `beforeinstallprompt` event
 *
 * @see https://web.dev/articles/customize-install
 * @see https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent
 */
export const pwaDeferredPromptAtom = atom<BeforeInstallPromptEvent | null>(
  null,
);
