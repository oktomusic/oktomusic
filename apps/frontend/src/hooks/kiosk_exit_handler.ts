import { useEffect } from "react";
import { useAtomValue } from "jotai";

import { settingClientKioskMode } from "../atoms/app/settings_client";

export function useKioskExitHandler() {
  const kioskModeEnabled = useAtomValue(settingClientKioskMode);

  useEffect(() => {
    if (!kioskModeEnabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const isEscape = event.key === "Escape";
      const isCtrlQ = event.ctrlKey && event.key.toLowerCase() === "q";

      if (!isEscape && !isCtrlQ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      window.alert("To exit kiosk mode, press Alt+F4.");
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown, { capture: true });
    };
  }, [kioskModeEnabled]);
}
