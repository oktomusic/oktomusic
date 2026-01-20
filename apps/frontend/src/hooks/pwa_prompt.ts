import { useEffect } from "react";
import { useSetAtom } from "jotai";

import { pwaDeferredPromptAtom } from "../atoms/app/atoms";

export function usePwaDeferedPrompt() {
  const setDeferredPrompt = useSetAtom(pwaDeferredPromptAtom);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault(); // Prevent automatic prompt
      setDeferredPrompt(e); // Save the event in Jotai
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handler as EventListener,
      );
  }, [setDeferredPrompt]);
}
