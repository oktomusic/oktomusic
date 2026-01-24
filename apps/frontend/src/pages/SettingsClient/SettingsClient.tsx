import type { ChangeEvent } from "react";

import { t } from "@lingui/core/macro";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import { audioSessionSupportAtom } from "../../atoms/app/browser_support.ts";
import {
  settingClientAudioSession,
  settingClientCrossfadeSeconds,
  settingClientKioskMode,
  settingClientSWMediaMaxAge,
  settingClientSWMediaMaxEntries,
  settingClientWakeLock,
} from "../../atoms/app/settings_client.ts";
import {
  requestStoragePersistenceAtom,
  storagePersistenceAtom,
} from "../../atoms/app/atoms.ts";

type KioskModeKey = "true" | "false";
type AudioSessionKey = "ambient" | "playback";
type WakeLockKey = "always" | "playback" | "never";

export default function SettingsClient() {
  const [kioskMode, setKioskMode] = useAtom(settingClientKioskMode);
  const [audioSessionType, setAudioSessionType] = useAtom(
    settingClientAudioSession,
  );
  const [wakeLockMode, setWakeLockMode] = useAtom(settingClientWakeLock);
  const [crossfadeSeconds, setCrossfadeSeconds] = useAtom(
    settingClientCrossfadeSeconds,
  );
  const [swMediaMaxEntries, setSwMediaMaxEntries] = useAtom(
    settingClientSWMediaMaxEntries,
  );
  const [swMediaMaxAge, setSwMediaMaxAge] = useAtom(settingClientSWMediaMaxAge);
  const audioSessionSupported = useAtomValue(audioSessionSupportAtom);
  const storagePersistence = useAtomValue(storagePersistenceAtom);
  const requestStoragePersistence = useSetAtom(requestStoragePersistenceAtom);

  const kioskModeLabels: Record<KioskModeKey, string> = {
    false: t`Disabled`,
    true: t`Enabled`,
  } as const;

  const audioSessionLabels: Record<AudioSessionKey, string> = {
    ambient: t`Ambient`,
    playback: t`Playback`,
  } as const;

  const wakeLockLabels: Record<WakeLockKey, string> = {
    always: t`Always`,
    playback: t`Playback`,
    never: t`Never`,
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

  const handleWakeLockChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as WakeLockKey;
    setWakeLockMode(value);
  };

  const handleSwMediaMaxEntriesChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const rawValue = Number.parseInt(event.target.value, 10);

    if (Number.isNaN(rawValue)) {
      setSwMediaMaxEntries(null);
      return;
    }

    const clampedValue = Math.max(0, rawValue);
    setSwMediaMaxEntries(clampedValue);
  };

  const handleSwMediaMaxAgeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = Number.parseInt(event.target.value, 10);

    if (Number.isNaN(rawValue)) {
      setSwMediaMaxAge(null);
      return;
    }

    // Convert days to seconds
    const clampedValue = Math.max(0, rawValue);
    const seconds = clampedValue * 24 * 60 * 60;
    setSwMediaMaxAge(seconds);
  };

  return (
    <section>
      <h2>Client Settings Page</h2>
      <form className="flex w-60 flex-col">
        <div role="status">
          {storagePersistence === null && `Checking storage persistence...`}
          {storagePersistence === true && `Persistent storage granted`}
          {storagePersistence === false && `Persistent storage not granted`}
          <button
            type="button"
            onClick={() => {
              void requestStoragePersistence();
            }}
            className="ml-4 underline"
          >
            {`Request persistent storage`}
          </button>
        </div>
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

        <label htmlFor="settings:client:wake-lock" className="mt-4">
          {t`Wake lock:`}
        </label>
        <select
          id="settings:client:wake-lock"
          value={wakeLockMode}
          onChange={handleWakeLockChange}
          aria-describedby="settings:client:wake-lock:help"
        >
          {(Object.keys(wakeLockLabels) as WakeLockKey[]).map((key) => (
            <option key={key} value={key}>
              {wakeLockLabels[key]}
            </option>
          ))}
        </select>

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

        <label htmlFor="settings:client:sw-media-max-entries" className="mt-4">
          {t`Service Worker max cache entries:`}
        </label>
        <input
          id="settings:client:sw-media-max-entries"
          type="number"
          min={0}
          step={1}
          value={swMediaMaxEntries ?? ""}
          onChange={handleSwMediaMaxEntriesChange}
          disabled={swMediaMaxEntries === null}
          aria-describedby="settings:client:sw-media-max-entries:help"
        />
        <p
          id="settings:client:sw-media-max-entries:help"
          role="status"
        >{t`Maximum number of media files to cache.`}</p>

        <label htmlFor="settings:client:sw-media-max-age" className="mt-4">
          {t`Service Worker max cache age (days):`}
        </label>
        <input
          id="settings:client:sw-media-max-age"
          type="number"
          min={0}
          step={1}
          value={
            swMediaMaxAge === null
              ? ""
              : Math.round(swMediaMaxAge / (24 * 60 * 60))
          }
          onChange={handleSwMediaMaxAgeChange}
          disabled={swMediaMaxAge === null}
          aria-describedby="settings:client:sw-media-max-age:help"
        />
        <p
          id="settings:client:sw-media-max-age:help"
          role="status"
        >{t`Maximum age of cached media in days`}</p>
      </form>
    </section>
  );
}
