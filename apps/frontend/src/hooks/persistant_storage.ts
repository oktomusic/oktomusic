import { useEffect } from "react";
import { useSetAtom } from "jotai";

import { storagePersistenceAtom } from "../atoms/app/atoms";

export function useStoragePersistence() {
  const setPersistence = useSetAtom(storagePersistenceAtom);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // 1. Check current state (NO prompt)
        const alreadyPersisted = await navigator.storage.persisted();

        if (cancelled) return;

        if (alreadyPersisted) {
          setPersistence(true);
          return;
        }

        // 2. Request persistence (may prompt)
        const granted = await navigator.storage.persist();

        if (!cancelled) {
          setPersistence(granted);
        }
      } catch {
        if (!cancelled) {
          setPersistence(false);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [setPersistence]);
}
