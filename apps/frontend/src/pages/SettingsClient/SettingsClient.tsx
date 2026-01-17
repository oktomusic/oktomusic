import type { ChangeEvent } from "react";

import { t } from "@lingui/core/macro";
import { useAtom, useAtomValue } from "jotai";

import { audioSessionSupportAtom } from "../../atoms/app/browser_support.ts";
import {
  settingClientAudioSession,
  settingClientCrossfadeSeconds,
  settingClientKioskMode,
} from "../../atoms/app/settings_client.ts";

type KioskModeKey = "true" | "false";
type AudioSessionKey = "ambient" | "playback";

export default function SettingsClient() {
  const [kioskMode, setKioskMode] = useAtom(settingClientKioskMode);
  const [audioSessionType, setAudioSessionType] = useAtom(
    settingClientAudioSession,
  );
  const [crossfadeSeconds, setCrossfadeSeconds] = useAtom(
    settingClientCrossfadeSeconds,
  );
  const audioSessionSupported = useAtomValue(audioSessionSupportAtom);

  const kioskModeLabels: Record<KioskModeKey, string> = {
    false: t`Disabled`,
    true: t`Enabled`,
  } as const;

  const audioSessionLabels: Record<AudioSessionKey, string> = {
    ambient: t`Ambient`,
    playback: t`Playback`,
  } as const;

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

  const handleAudioSessionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as AudioSessionKey;
    setAudioSessionType(value);
  };

  return (
    <section>
      <h2>Client Settings Page</h2>
      <form className="flex w-60 flex-col">
        <label
          htmlFor="settings:client:kiosk-mode"
          className="mt-4"
        >{t`Kiosk mode:`}</label>
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

        <label htmlFor="settings:client:audio-session" className="mt-4">
          {t`Audio session:`}
        </label>
        <select
          id="settings:client:audio-session"
          value={audioSessionType}
          onChange={handleAudioSessionChange}
          disabled={!audioSessionSupported}
          aria-describedby="settings:client:audio-session:help"
        >
          {(Object.keys(audioSessionLabels) as AudioSessionKey[]).map((key) => (
            <option key={key} value={key}>
              {audioSessionLabels[key]}
            </option>
          ))}
        </select>
        <p id="settings:client:audio-session:help" role="status">
          {audioSessionSupported
            ? t`Controls how Oktomusic mixes with other audio.`
            : t`Audio Session API is not supported in this browser.`}
        </p>

        <label htmlFor="settings:client:crossfade-seconds" className="mt-4">
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
