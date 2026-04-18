import type { ChangeEvent } from "react";

import { t } from "@lingui/core/macro";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import {
  audioSessionSupportAtom,
  translatorSupportAtom,
} from "../../atoms/app/browser_support.ts";
import {
  AudioSessionKey,
  settingClientAudioSession,
  settingClientCrossfadeSeconds,
  settingClientKioskMode,
  settingClientLyricsDisplayMode,
  settingClientLyricsTranslationEnabled,
  settingClientSWMediaMaxAge,
  settingClientSWMediaMaxEntries,
  settingClientWakeLock,
  WakeLockKey,
  type LyricsDisplayModeKey,
} from "../../atoms/app/settings_client.ts";
import {
  requestStoragePersistenceAtom,
  storagePersistenceAtom,
} from "../../atoms/app/atoms.ts";
import { OktoSwitch } from "../../components/Base/OktoSwitch.tsx";
import { OktoListbox } from "../../components/Base/OktoListbox.tsx";
import { OktoSlider } from "../../components/Base/OktoSlider.tsx";
import { OktoInput } from "../../components/Base/OktoInput.tsx";
import { OktoButton } from "../../components/Base/OktoButton.tsx";

export function SettingsClient() {
  const [kioskMode, setKioskMode] = useAtom(settingClientKioskMode);
  const [audioSessionType, setAudioSessionType] = useAtom(
    settingClientAudioSession,
  );
  const [wakeLockMode, setWakeLockMode] = useAtom(settingClientWakeLock);
  const [lyricsDisplayMode, setLyricsDisplayMode] = useAtom(
    settingClientLyricsDisplayMode,
  );
  const [lyricsTranslationEnabled, setLyricsTranslationEnabled] = useAtom(
    settingClientLyricsTranslationEnabled,
  );
  const translatorSupport = useAtomValue(translatorSupportAtom);
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

  const audioSessionLabels: Record<AudioSessionKey, string> = {
    ambient: t`Ambient`,
    playback: t`Playback`,
  } as const;

  const wakeLockLabels: Record<WakeLockKey, string> = {
    always: t`Always`,
    playback: t`Playback`,
    never: t`Never`,
  } as const;

  const lyricsDisplayModeLabels: Record<LyricsDisplayModeKey, string> = {
    word: t`Word by word`,
    line: t`Line by line`,
    static: t`Static`,
  } as const;

  const handleCrossfadeChange = (value: number) => {
    const roundedValue = Math.round(value * 10) / 10;
    setCrossfadeSeconds(roundedValue);
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
    <div className="flex min-h-full w-full flex-row justify-center">
      <div className="w-4xl p-8">
        <h2 className="mb-8 text-3xl font-bold">{t`Client Settings`}</h2>
        <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
          <div className="flex h-14 flex-row items-center justify-between py-2">
            <label
              htmlFor="settings:client:kiosk-mode"
              className=""
            >{t`Kiosk mode:`}</label>
            <OktoSwitch
              id="settings:client:kiosk-mode"
              checked={kioskMode}
              onChange={setKioskMode}
            />
          </div>

          <div className="flex h-14 flex-row items-center justify-between py-2">
            <label htmlFor="settings:client:audio-session">
              {t`Audio session:`}
            </label>
            <OktoListbox
              id="settings:client:audio-session"
              value={audioSessionType}
              onChange={setAudioSessionType}
              options={audioSessionLabels}
              disabled={!audioSessionSupported}
              aria-describedby="settings:client:audio-session:help"
            />
          </div>

          <div className="flex h-14 flex-row items-center justify-between py-2">
            <label htmlFor="settings:client:wake-lock">{t`Wake lock:`}</label>
            <OktoListbox
              id="settings:client:wake-lock"
              value={wakeLockMode}
              onChange={setWakeLockMode}
              options={wakeLockLabels}
              aria-describedby="settings:client:wake-lock:help"
            />
          </div>

          <div className="flex h-14 flex-row items-center justify-between py-2">
            <label htmlFor="settings:client:lyrics-display-mode">{t`Lyrics display mode:`}</label>
            <OktoListbox
              id="settings:client:lyrics-display-mode"
              value={lyricsDisplayMode}
              onChange={setLyricsDisplayMode}
              options={lyricsDisplayModeLabels}
              aria-describedby="settings:client:lyrics-display-mode:help"
            />
          </div>

          <div className="flex h-14 flex-row items-center justify-between py-2">
            <label
              htmlFor="settings:client:lyrics-translation-enabled"
              className=""
            >{t`Lyrics translation:`}</label>
            <OktoSwitch
              id="settings:client:lyrics-translation-enabled"
              checked={lyricsTranslationEnabled}
              title={
                translatorSupport
                  ? undefined
                  : t`Your browser does not support lyrics translation`
              }
              onChange={setLyricsTranslationEnabled}
              disabled={!translatorSupport}
            />
          </div>

          <div className="flex h-14 flex-row items-center justify-between py-2">
            <span>{t`Crossfade (seconds):`}</span>
            <div className="flex w-56 items-center gap-3">
              <OktoSlider
                id="settings:client:crossfade-seconds"
                value={crossfadeSeconds}
                onChange={handleCrossfadeChange}
                min={0}
                max={5}
                step={0.1}
                aria-describedby="settings:client:crossfade-seconds:help"
                aria-label={t`Crossfade (seconds)`}
                className="flex-1"
              />
              <span className="min-w-12 text-right text-sm text-white tabular-nums select-none">
                {crossfadeSeconds.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex h-14 flex-row items-center justify-between py-2">
            <label htmlFor="settings:client:sw-media-max-entries">
              {t`Cache max entries:`}
            </label>
            <OktoInput
              id="settings:client:sw-media-max-entries"
              type="number"
              min={0}
              step={1}
              value={swMediaMaxEntries ?? ""}
              onChange={handleSwMediaMaxEntriesChange}
              aria-describedby="settings:client:sw-media-max-entries:help"
            />
          </div>

          <div className="flex h-14 flex-row items-center justify-between py-2">
            <label htmlFor="settings:client:sw-media-max-age">
              {t`Cache max age (days):`}
            </label>
            <OktoInput
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
              aria-describedby="settings:client:sw-media-max-age:help"
            />
          </div>

          <div className="flex flex-col py-2">
            <div className="mb-2 text-sm font-medium">{t`Storage Persistence:`}</div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-white/80">
                {storagePersistence === null &&
                  t`Checking storage persistence...`}
                {storagePersistence === true && t`Persistent storage granted`}
                {storagePersistence === false &&
                  t`Persistent storage not granted`}
              </span>
              {storagePersistence === false && (
                <OktoButton
                  type="button"
                  onClick={() => {
                    void requestStoragePersistence();
                  }}
                >
                  {t`Request`}
                </OktoButton>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
