import type { ChangeEvent } from "react";

import { useAtom } from "jotai";
import { t } from "@lingui/core/macro";

import { settingClientKioskMode } from "../../atoms/app/settings_client.ts";

type KioskModeKey = "true" | "false";

export default function SettingsClient() {
  const [kioskMode, setKioskMode] = useAtom(settingClientKioskMode);

  const kioskModeLabels: Record<KioskModeKey, string> = {
    false: t`Disabled`,
    true: t`Enabled`,
  };

  const handleKioskModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as KioskModeKey;
    setKioskMode(value === "true");
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
      </form>
    </section>
  );
}
