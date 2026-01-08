import type { ChangeEvent } from "react";

import { useAtom } from "jotai";
import { t } from "@lingui/core/macro";

import {
  settingClientCrossfadeSeconds,
  settingClientKioskMode,
} from "../../atoms/app/settings_client.ts";

type KioskModeKey = "true" | "false";

export default function SettingsClient() {
  const [kioskMode, setKioskMode] = useAtom(settingClientKioskMode);
  const [crossfadeSeconds, setCrossfadeSeconds] = useAtom(
    settingClientCrossfadeSeconds,
  );

  const kioskModeLabels: Record<KioskModeKey, string> = {
    false: t`Disabled`,
    true: t`Enabled`,
  };

  const handleKioskModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as KioskModeKey;
    setKioskMode(value === "true");
  };

  const handleCrossfadeSecondsChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const rawValue = Number.parseFloat(event.target.value);

    if (Number.isNaN(rawValue)) {
      return;
    }

    const clampedValue = Math.min(5, Math.max(0, rawValue));
    const roundedValue = Math.round(clampedValue * 10) / 10;
    setCrossfadeSeconds(roundedValue);
  };

  return (
    <section>
      <h2>Client Settings Page</h2>
      <form className="flex max-w-32 flex-col">
        <label htmlFor="settings:client:kiosk-mode">{t`Kiosk mode:`}</label>
        <select
          id="settings:client:kiosk-mode"
          value={kioskMode ? "true" : "false"}
          onChange={handleKioskModeChange}
        >
          {(Object.keys(kioskModeLabels) as KioskModeKey[]).map((key) => (
            <option key={key} value={key}>
              {kioskModeLabels[key]}
            </option>
          ))}
        </select>
        <p role="status">{kioskMode ? t`Enabled` : t`Disabled`}</p>

        <label htmlFor="settings:client:crossfade-seconds">
          {t`Crossfade (seconds):`}
        </label>
        <input
          id="settings:client:crossfade-seconds"
          type="range"
          min={0}
          max={5}
          step={0.1}
          value={crossfadeSeconds}
          onChange={handleCrossfadeSecondsChange}
          aria-describedby="settings:client:crossfade-seconds:value"
        />
        <output id="settings:client:crossfade-seconds:value" aria-live="polite">
          {crossfadeSeconds.toFixed(1)}
        </output>
      </form>
    </section>
  );
}
