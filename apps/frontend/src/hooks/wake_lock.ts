import { useCallback, useEffect, useRef } from "react";
import { useAtomValue } from "jotai";

import { shouldHoldWakeLockAtom } from "../atoms/player/wake_lock";

export function useScreenWakeLock(): void {
  const shouldHold = useAtomValue(shouldHoldWakeLockAtom);

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const seqRef = useRef<number>(0);

  const setWakeLock = useCallback((lock: WakeLockSentinel) => {
    lock.onrelease = () => {
      if (wakeLockRef.current === lock) {
        lock.onrelease = null;
        wakeLockRef.current = null;
      }
    };

    wakeLockRef.current = lock;
  }, []);

  const releaseWakeLock = useCallback(async () => {
    const lock = wakeLockRef.current;
    if (!lock) {
      return;
    }

    wakeLockRef.current = null;
    lock.onrelease = null;
    await lock.release();
  }, []);

  useEffect(() => {
    const seq = ++seqRef.current;
    let cancelled = false;

    async function sync() {
      try {
        if (!shouldHold) {
          await releaseWakeLock();
          return;
        }

        if (!wakeLockRef.current) {
          const lock = await navigator.wakeLock.request("screen");

          if (cancelled || seq !== seqRef.current) {
            await lock.release();
            return;
          }

          setWakeLock(lock);
        }
      } catch {
        console.warn("Failed to sync wake lock");
      }
    }

    void sync();
    return () => {
      cancelled = true;
      if (shouldHold) {
        void releaseWakeLock();
      }
    };
  }, [releaseWakeLock, setWakeLock, shouldHold]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        shouldHold &&
        !wakeLockRef.current
      ) {
        const seq = ++seqRef.current;

        navigator.wakeLock
          .request("screen")
          .then((lock) => {
            if (seq !== seqRef.current) {
              void lock.release();
              return;
            }
            setWakeLock(lock);
          })
          .catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [setWakeLock, shouldHold]);
}
