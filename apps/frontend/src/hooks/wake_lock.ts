import { useEffect, useRef } from "react";
import { useAtomValue } from "jotai";

import { shouldHoldWakeLockAtom } from "../atoms/player/wake_lock";

export function useScreenWakeLock(): void {
  const shouldHold = useAtomValue(shouldHoldWakeLockAtom);

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const seqRef = useRef<number>(0);

  useEffect(() => {
    const seq = ++seqRef.current;

    async function sync() {
      try {
        if (!shouldHold && wakeLockRef.current) {
          const lock = wakeLockRef.current;
          wakeLockRef.current = null;
          await lock.release();
        }

        if (shouldHold && !wakeLockRef.current) {
          const lock = await navigator.wakeLock.request("screen");

          if (seq !== seqRef.current) {
            await lock.release();
            return;
          }

          lock.addEventListener("release", () => {
            if (wakeLockRef.current === lock) {
              wakeLockRef.current = null;
            }
          });

          wakeLockRef.current = lock;
        }
      } catch {
        console.warn("Failed to sync wake lock");
      }
    }

    void sync();
  }, [shouldHold]);

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
            wakeLockRef.current = lock;
          })
          .catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [shouldHold]);
}
