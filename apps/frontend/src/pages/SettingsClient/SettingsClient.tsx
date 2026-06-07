import { ChangeEvent, useCallback } from "react";

import { t } from "@lingui/core/macro";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";

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
  settingClientRestartThresholdSeconds,
  settingClientSWMediaMaxAge,
  settingClientSWMediaMaxEntries,
  settingClientVolumeEnabled,
  settingClientWakeLock,
  WakeLockKey,
  type LyricsDisplayModeKey,
  applicationLanguage,
} from "../../atoms/app/settings_client.ts";
import {
  requestStoragePersistenceAtom,
  storagePersistenceAtom,
} from "../../atoms/app/atoms.ts";
import { OktoSwitch } from "../../components/Base/OktoSwitch.tsx";
import {
  OktoListbox,
  OktoListboxItem,
} from "../../components/Base/OktoListbox.tsx";
import { OktoSlider } from "../../components/Base/OktoSlider.tsx";
import { OktoInput } from "../../components/Base/OktoInput.tsx";
import { OktoButton } from "../../components/Base/OktoButton.tsx";
import { SupportedLocale } from "../../utils/supported_locales.ts";
import { dynamicActivate } from "../../utils/i18n_loader.ts";
import FrenchFlag from "../../assets/country_flags/french_flag.svg";
import BritishFlag from "../../assets/country_flags/british_flag.svg";

export function SettingsClient() {
  const [kioskMode, setKioskMode] = useAtom(settingClientKioskMode);
  const [audioSessionType, setAudioSessionType] = useAtom(
    settingClientAudioSession,
  );
  const [wakeLockMode, setWakeLockMode] = useAtom(settingClientWakeLock);
  const [lyricsDisplayMode, setLyricsDisplayMode] = useAtom(
    settingClientLyricsDisplayMode,
  );
  const [appLanguage, setAppLanguage] = useAtom(applicationLanguage);
  const onAppLanguageChange = useCallback(
    (appLanguage: SupportedLocale) => {
      void dynamicActivate(appLanguage);
      setAppLanguage(appLanguage);
    },
    [setAppLanguage],
  );

  const [lyricsTranslationEnabled, setLyricsTranslationEnabled] = useAtom(
    settingClientLyricsTranslationEnabled,
  );
  const translatorSupport = useAtomValue(translatorSupportAtom);
  const [crossfadeSeconds, setCrossfadeSeconds] = useAtom(
    settingClientCrossfadeSeconds,
  );
  const [volumeEnabled, setVolumeEnabled] = useAtom(settingClientVolumeEnabled);
  const [restartThresholdSeconds, setRestartThresholdSeconds] = useAtom(
    settingClientRestartThresholdSeconds,
  );
  const [swMediaMaxEntries, setSwMediaMaxEntries] = useAtom(
    settingClientSWMediaMaxEntries,
  );
  const [swMediaMaxAge, setSwMediaMaxAge] = useAtom(settingClientSWMediaMaxAge);
  const audioSessionSupported = useAtomValue(audioSessionSupportAtom);
  const storagePersistence = useAtomValue(storagePersistenceAtom);
  const requestStoragePersistence = useSetAtom(requestStoragePersistenceAtom);

  const audioSessionOptions: readonly OktoListboxItem<AudioSessionKey>[] = [
    { value: "ambient", label: t`Ambient` },
    { value: "playback", label: t`Playback` },
  ];

  const wakeLockOptions: readonly OktoListboxItem<WakeLockKey>[] = [
    { value: "always", label: t`Always` },
    { value: "playback", label: t`Playback` },
    { value: "never", label: t`Never` },
  ];

  const lyricsDisplayModeOptions: readonly OktoListboxItem<LyricsDisplayModeKey>[] =
    [
      { value: "word", label: t`Word by word` },
      { value: "line", label: t`Line by line` },
      { value: "static", label: t`Static` },
    ];

  const languageDisplayLabels: OktoListboxItem<SupportedLocale>[] = [
    { value: "en", label: "English", icon: BritishFlag },
    {
      value: "fr",
      label: "Français",
      icon: FrenchFlag,
    },
  ];

  const handleCrossfadeChange = (value: number) => {
    const roundedValue = Math.round(value * 10) / 10;
    setCrossfadeSeconds(roundedValue);
  };

  const handleRestartThresholdChange = (value: number) => {
    const roundedValue = Math.round(value * 10) / 10;
    setRestartThresholdSeconds(roundedValue);
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
              onCheckedChange={setKioskMode}
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
              options={audioSessionOptions}
              disabled={!audioSessionSupported}
            />
          </div>

          <div className="flex h-14 flex-row items-center justify-between py-2">
            <label htmlFor="settings:client:wake-lock">{t`Wake lock:`}</label>
            <OktoListbox
              id="settings:client:wake-lock"
              value={wakeLockMode}
              onChange={setWakeLockMode}
              options={wakeLockOptions}
            />
          </div>

          <div className="flex h-14 flex-row items-center justify-between py-2">
            <label htmlFor="settings:client:lyrics-display-mode">{t`Lyrics display mode:`}</label>
            <OktoListbox
              id="settings:client:lyrics-display-mode"
              value={lyricsDisplayMode}
              onChange={setLyricsDisplayMode}
              options={lyricsDisplayModeOptions}
            />
          </div>

          <div className="flex h-14 flex-row items-center justify-between py-2">
            <label htmlFor="settings:client:app-language">{t`Application language:`}</label>
            <OktoListbox
              id="settings:client:app-language"
              value={appLanguage}
              onChange={onAppLanguageChange}
              options={languageDisplayLabels}
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
              onCheckedChange={setLyricsTranslationEnabled}
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
                aria-label={t`Crossfade (seconds)`}
                className="flex-1"
              />
              <span className="min-w-12 text-right text-sm text-white tabular-nums select-none">
                {crossfadeSeconds.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex h-14 flex-row items-center justify-between py-2">
            <label
              htmlFor="settings:client:volume-enabled"
              className=""
            >{t`Volume enabled:`}</label>
            <OktoSwitch
              id="settings:client:volume-enabled"
              checked={volumeEnabled}
              onCheckedChange={setVolumeEnabled}
            />
          </div>

          <div className="flex h-14 flex-row items-center justify-between py-2">
            <span>{t`Restart threshold (seconds):`}</span>
            <div className="flex w-56 items-center gap-3">
              <OktoSlider
                id="settings:client:restart-threshold-seconds"
                value={restartThresholdSeconds}
                onChange={handleRestartThresholdChange}
                min={1}
                max={10}
                step={0.1}
                aria-label={t`Restart threshold (seconds)`}
                className="flex-1"
              />
              <span className="min-w-12 text-right text-sm text-white tabular-nums select-none">
                {restartThresholdSeconds === 10
                  ? "∞"
                  : restartThresholdSeconds.toFixed(1)}
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

          <div className="flex justify-end">
            <OktoButton
              type="button"
              onClick={() => {
                // Reset all settings to their default values
                setKioskMode(RESET);
                setAudioSessionType(RESET);
                setWakeLockMode(RESET);
                setLyricsDisplayMode(RESET);
                setLyricsTranslationEnabled(RESET);
                setCrossfadeSeconds(RESET);
                setRestartThresholdSeconds(RESET);
                setSwMediaMaxEntries(RESET);
                setSwMediaMaxAge(RESET);
              }}
            >
              {t`Reset`}
            </OktoButton>
          </div>
        </form>
      </div>
    </div>
  );
}
