import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import {
  batteryChargingAtom,
  batteryPercentageAtom,
} from "../atoms/app/battery.ts";
import { batterySupportAtom } from "../atoms/app/browser_support.ts";
import { settingClientBatteryIndicator } from "../atoms/app/settings_client.ts";

export function useBatteryStatus(): void {
  const enabled = useAtomValue(settingClientBatteryIndicator);
  const supported = useAtomValue(batterySupportAtom);
  const setPercentage = useSetAtom(batteryPercentageAtom);
  const setCharging = useSetAtom(batteryChargingAtom);

  useEffect(() => {
    let cancelled = false;
    let battery: BatteryManager | undefined;

    const clear = () => {
      setPercentage(null);
      setCharging(null);
    };

    const update = () => {
      if (cancelled || !battery) return;

      setPercentage(Math.round(battery.level * 100));
      setCharging(battery.charging);
    };

    async function initialize() {
      if (!enabled || !supported || !navigator.getBattery) return;

      try {
        const manager = await navigator.getBattery();
        if (cancelled) return;

        battery = manager;
        battery.addEventListener("levelchange", update);
        battery.addEventListener("chargingchange", update);
        update();
      } catch {
        if (!cancelled) clear();
      }
    }

    clear();
    void initialize();

    return () => {
      cancelled = true;
      battery?.removeEventListener("levelchange", update);
      battery?.removeEventListener("chargingchange", update);
      clear();
    };
  }, [enabled, supported, setPercentage, setCharging]);
}
