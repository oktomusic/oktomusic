import { useEffect, useMemo, useRef } from "react";
import { Button } from "@headlessui/react";
import { useAtom } from "jotai";
import { LuVolume2, LuVolumeX } from "react-icons/lu";

import { OktoSlider } from "../Base/OktoSlider";
import {
  settingClientVolume,
  settingClientVolumeMuted,
} from "../../atoms/app/settings_client";

const minimumVolume = 1;

/**
 * Controls volume and mute state for the player.
 *
 * - `volume` is the persisted non-zero volume used for playback.
 * - `muted` toggles the visual zero state; when true the slider shows 0 but
 *   the stored `volume` stays at least `minimumVolume`.
 * - `lastCommittedVolumeRef` remembers the last intentional slider commit so
 *   unmuting returns to that value.
 *
 * Dragging to 0 sets `muted` without storing 0. Committing a positive value
 * updates the ref, clears `muted`, and persists the new volume.
 */
export function PlayerControlsVolume() {
  const [volume, setVolume] = useAtom(settingClientVolume);
  const [muted, setMuted] = useAtom(settingClientVolumeMuted);
  const lastCommittedVolumeRef = useRef<number>(
    Math.max(volume, minimumVolume),
  );

  useEffect(() => {
    if (volume >= minimumVolume) {
      return;
    }

    lastCommittedVolumeRef.current = minimumVolume;
    if (!muted) {
      setMuted(true);
    }
    setVolume(minimumVolume);
  }, [muted, setMuted, setVolume, volume]);

  const Icon = useMemo(() => {
    if (muted) {
      return <LuVolumeX className="size-6" />;
    }
    return <LuVolume2 className="size-6" />;
  }, [muted]);

  const handleMuteToggle = () => {
    if (muted) {
      setMuted(false);
      setVolume(lastCommittedVolumeRef.current);
      return;
    }

    setMuted(true);
  };

  const handleVolumeChange = (value: number) => {
    if (value <= 0) {
      setMuted(true);
      return;
    }

    const clampedValue = Math.max(minimumVolume, value);

    if (muted) {
      setMuted(false);
    }

    setVolume(clampedValue);
  };

  const handleVolumeCommit = (value: number) => {
    if (value <= 0) {
      setMuted(true);
      setVolume(lastCommittedVolumeRef.current);
      return;
    }

    const clampedValue = Math.max(minimumVolume, value);
    lastCommittedVolumeRef.current = clampedValue;

    if (muted) {
      setMuted(false);
    }

    setVolume(clampedValue);
  };

  return (
    <>
      <Button
        className="rounded p-2 hover:bg-white/10 focus-visible:outline-offset-2"
        onClick={handleMuteToggle}
      >
        {Icon}
      </Button>
      <OktoSlider
        id="oktomusic:player:volume"
        aria-label="Volume"
        min={0}
        max={100}
        step={1}
        value={muted ? 0 : volume}
        onChange={handleVolumeChange}
        onCommit={handleVolumeCommit}
        className="w-32"
      />
    </>
  );
}
