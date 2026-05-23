import { PlayerControlsInfos } from "./PlayerControlsInfos";
import { PlayerControlsPlayback } from "./PlayerControlsPlayback";
import { PlayerControlsAdditional } from "./PlayerControlsAdditional";

export function PlayerControls() {
  return (
    <div className="flex h-24 w-full flex-row justify-between p-2">
      <PlayerControlsInfos />
      <PlayerControlsPlayback />
      <PlayerControlsAdditional />
    </div>
  );
}
