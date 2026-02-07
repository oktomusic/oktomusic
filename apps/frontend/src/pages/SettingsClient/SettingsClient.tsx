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
import { OktoSwitch } from "../../components/Base/OktoSwitch.tsx";
import { OktoListbox } from "../../components/Base/OktoListbox.tsx";
import { OktoSlider } from "../../components/Base/OktoSlider.tsx";
import { OktoInput } from "../../components/Base/OktoInput.tsx";
import { OktoButton } from "../../components/Base/OktoButton.tsx";

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

  const audioSessionLabels: Record<AudioSessionKey, string> = {
    ambient: t`Ambient`,
    playback: t`Playback`,
  } as const;

  const wakeLockLabels: Record<WakeLockKey, string> = {
    always: t`Always`,
    playback: t`Playback`,
    never: t`Never`,
  } as const;

  const handleAudioSessionChange = (value: AudioSessionKey) => {
    setAudioSessionType(value);
  };

  const handleWakeLockChange = (value: WakeLockKey) => {
    setWakeLockMode(value);
  };

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
              onChange={handleAudioSessionChange}
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
              onChange={handleWakeLockChange}
              options={wakeLockLabels}
              aria-describedby="settings:client:wake-lock:help"
            />
          </div>

          <div className="flex h-14 flex-row items-center justify-between py-2">
            <label htmlFor="settings:client:crossfade-seconds">
              {t`Crossfade (seconds):`}
            </label>
            <OktoSlider
              id="settings:client:crossfade-seconds"
              value={crossfadeSeconds}
              onChange={handleCrossfadeChange}
              min={0}
              max={5}
              step={0.1}
              showOutput
              formatOutput={(v) => v.toFixed(1)}
              aria-describedby="settings:client:crossfade-seconds:help"
            />
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
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis quis
            turpis et purus pulvinar tincidunt. Integer vulputate, mi at
            dignissim imperdiet, risus lacus viverra ipsum, non varius mi sapien
            sed nulla. Vivamus vel porta quam. Aenean fringilla lacus a ex
            vestibulum sodales. Maecenas non finibus quam. Suspendisse volutpat
            eu augue sed porttitor. Pellentesque euismod sollicitudin gravida.
            Phasellus sit amet arcu mattis nunc luctus gravida. Nam vulputate
            congue massa quis consequat. In tincidunt, mi et pretium porttitor,
            magna dui tristique felis, in volutpat turpis urna non arcu. Aliquam
            erat volutpat. Duis nisl lectus, porttitor eget blandit condimentum,
            auctor cursus eros. Sed et feugiat sapien. Donec placerat erat sit
            amet ex cursus, eu consectetur diam viverra. Sed vehicula
            scelerisque turpis, ac placerat libero suscipit eget. Morbi vel
            purus ullamcorper, molestie justo et, imperdiet risus. In mattis,
            purus ac tincidunt sagittis, dolor nisl sodales odio, vitae
            consectetur urna lorem non dui. Donec sit amet ipsum vel erat
            vehicula dapibus ut ut augue. Proin id est vel neque maximus
            sagittis. Suspendisse ac laoreet dolor. Nam rhoncus eget massa at
            imperdiet. Donec vel fermentum nulla, malesuada aliquam purus. Fusce
            volutpat elit eu nunc finibus maximus. Aenean sit amet orci quis
            purus dapibus tristique. Vivamus id est vitae metus mattis ornare ut
            non massa. Donec venenatis vehicula sapien non mattis. Aenean
            ultrices orci erat, porttitor finibus nibh gravida eu. Vivamus
            rutrum lobortis tortor eget consectetur. Vivamus vitae ultricies
            erat. Vivamus euismod scelerisque diam, quis bibendum risus.
            Curabitur fermentum mollis turpis, eu bibendum urna dapibus congue.
            Integer aliquet magna sit amet leo pellentesque tristique. Morbi
            molestie aliquam turpis vel consequat. Donec placerat, eros eu
            pellentesque venenatis, sapien lorem consectetur urna, nec auctor
            ligula sapien ut justo. Vivamus a lorem velit. Donec sit amet
            dapibus nunc. Suspendisse turpis leo, ornare vel condimentum non,
            tristique id nunc. Curabitur at venenatis massa. Aliquam sed
            porttitor magna. Cras lacus quam, aliquet vitae suscipit quis,
            ornare non leo. Duis non finibus metus, nec fringilla tellus. Donec
            aliquam lorem quis ipsum hendrerit, gravida blandit nisl congue.
            Morbi id diam vel tellus posuere tincidunt. Duis vitae rhoncus urna.
            Vivamus ac metus dolor. Class aptent taciti sociosqu ad litora
            torquent per conubia nostra, per inceptos himenaeos. Cras commodo
            orci at mauris volutpat consequat. Curabitur scelerisque ut augue
            pulvinar rutrum. Duis vitae hendrerit elit, sit amet semper lectus.
            Phasellus felis turpis, interdum non justo vel, blandit dignissim
            lacus. Ut commodo rutrum urna id elementum. Vivamus tristique, ante
            interdum lacinia accumsan, diam elit malesuada enim, at volutpat
            enim odio id eros. Sed laoreet elit ac dolor pulvinar, at
            condimentum purus rutrum. Vestibulum a neque vitae nibh vulputate
            accumsan vitae non velit. Pellentesque at feugiat augue. Mauris
            gravida eleifend lectus vel fringilla. Nulla ornare sed enim et
            laoreet. Cras non volutpat tellus. Integer non eros mattis,
            tincidunt ligula et, dictum orci. Pellentesque habitant morbi
            tristique senectus et netus et malesuada fames ac turpis egestas.
            Quisque nec pulvinar nulla. Class aptent taciti sociosqu ad litora
            torquent per conubia nostra, per inceptos himenaeos. Quisque maximus
            nisi dui, in laoreet ex rhoncus at. Fusce a convallis turpis.
            Vestibulum in magna vel mauris lobortis finibus. Nulla mollis nec
            lectus non gravida. Quisque ac odio neque. Integer eleifend odio
            est. Sed augue nibh, auctor dapibus bibendum non, dictum id purus.
            Vestibulum ullamcorper scelerisque orci. Aenean iaculis eu ante eu
            posuere. Sed a nisi pharetra, fermentum leo vitae, facilisis urna.
            Curabitur dignissim gravida lacus sit amet iaculis. Curabitur eu
            diam non velit accumsan dignissim. In dictum a dolor in mollis.
            Etiam vel mi pharetra, maximus ligula vel, molestie nisi. Donec et
            fermentum sapien, ut commodo augue. Cras nec est tempor, congue urna
            ac, vulputate est. Maecenas vitae ligula urna. Phasellus et eros
            maximus nisl consequat facilisis. Aenean in tempus turpis.
            Vestibulum bibendum condimentum tortor at feugiat. Fusce in
            malesuada velit, in mollis lorem. Nam mollis dictum odio, vel
            molestie tellus aliquet in. Pellentesque tincidunt, risus laoreet
            commodo mattis, tellus dui aliquet ex, efficitur tincidunt nunc nisl
            non justo. Duis pretium elit eu malesuada aliquet. Cras ac tortor
            rhoncus urna ultrices rhoncus. Pellentesque habitant morbi tristique
            senectus et netus et malesuada fames ac turpis egestas. Nunc tempus
            dapibus consequat. Donec eget odio commodo ligula venenatis auctor
            et ac orci. Suspendisse ultricies nec massa non pellentesque. Sed
            sapien leo, sagittis et pretium ac, ultrices rutrum elit. Nam mollis
            nibh et ante bibendum, sit amet elementum augue tristique.
            Pellentesque cursus diam vel erat congue, ut convallis felis
            sodales. Nulla accumsan libero dictum sapien posuere consectetur.
            Curabitur a mauris lorem. Nunc mollis viverra pellentesque. Sed
            ultrices fringilla sapien, ut fermentum orci ultrices vitae. Fusce
            rhoncus odio sit amet arcu molestie feugiat. Nunc rhoncus velit non
            libero rutrum tincidunt. Cras laoreet semper nisl id bibendum.
            Aenean sed hendrerit tortor, ut aliquet purus. Vestibulum non ligula
            augue. Vestibulum felis velit, elementum sit amet elementum ut,
            semper eget quam. Curabitur non felis odio. Donec vitae sem posuere,
            sollicitudin dolor eu, aliquam ipsum. Curabitur sed nibh imperdiet,
            facilisis lorem vitae, aliquet ante. Vivamus a arcu euismod, finibus
            massa non, mattis nibh. Phasellus auctor tellus quam. Pellentesque
            congue nisl in purus faucibus, a porttitor risus aliquet. Donec
            euismod et dui et volutpat.
          </p>
        </form>
      </div>
    </div>
  );
}
