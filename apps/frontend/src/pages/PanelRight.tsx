import { useAtomValue, useSetAtom } from "jotai";
import { t } from "@lingui/core/macro";

import {
  handleSeekToQueueIndexAtom,
  handleSeekToManualQueueIndexAtom,
  playerIsPlayingAtom,
  playerQueueAtom,
  playerQueueCurrentTrack,
  playerQueueCurrentTrackSourceAtom,
  playerQueueFromAtom,
  playerQueueManualAtom,
  playerQueueMainIndexAtom,
  requestPlaybackToggleAtom,
} from "../atoms/player/machine";
import { panelRightVisibleAtom } from "../atoms/app/panels";
import { QueueTrack } from "../components/QueueTrack/QueueTrack";
import { OktoScrollArea } from "../components/Base/OktoScrollArea";

export function PanelRight() {
  const visible = useAtomValue(panelRightVisibleAtom);
  const queueIndex = useAtomValue(playerQueueMainIndexAtom);
  const queue = useAtomValue(playerQueueAtom);
  const manualQueue = useAtomValue(playerQueueManualAtom);
  const currentTrack = useAtomValue(playerQueueCurrentTrack);
  const currentTrackSource = useAtomValue(playerQueueCurrentTrackSourceAtom);
  const queueFrom = useAtomValue(playerQueueFromAtom);
  const isPlaying = useAtomValue(playerIsPlayingAtom);

  const handleSeekToQueueIndex = useSetAtom(handleSeekToQueueIndexAtom);
  const handleSeekToManualQueueIndex = useSetAtom(
    handleSeekToManualQueueIndexAtom,
  );
  const togglePlayback = useSetAtom(requestPlaybackToggleAtom);

  const manualQueueUpNext =
    currentTrackSource === "manual" ? manualQueue.slice(1) : manualQueue;
  const hasManualQueue = manualQueueUpNext.length > 0;
  const hasMainQueueLoaded = queueFrom !== null;
  const mainQueueUpNext = queue.slice(queueIndex + 1);
  const queueFromLabel = queueFrom?.meta.name ?? "Unknown source";

  if (!visible) {
    return null;
  }

  const handleTrackClick = (index: number) => {
    if (index === queueIndex) {
      // Current track: toggle play/pause
      togglePlayback();
    } else {
      // Different track: seek to it
      handleSeekToQueueIndex(index);
    }
  };

  return (
    <aside
      id="oktomusic:panel-right"
      className="flex flex-col overflow-hidden rounded bg-zinc-900"
      aria-label="Queue"
    >
      <p className="p-4 text-sm font-semibold text-white/70">Queue</p>
      <OktoScrollArea
        render={<ol />}
        className="mx-2 flex flex-1 flex-col gap-6"
        noMargin={true}
      >
        <li className="flex flex-col">
          <span className="p-2 text-sm font-semibold">{t`Now playing`}</span>
          <ol className="flex flex-col">
            {currentTrack && (
              <QueueTrack
                track={currentTrack}
                isCurrent={true}
                isPlaying={isPlaying}
                onClickPlay={() => {
                  togglePlayback();
                }}
              />
            )}
          </ol>
        </li>
        {hasManualQueue && (
          <li className="flex flex-col">
            <span className="p-2 text-sm font-semibold">{t`Next in queue`}</span>
            <ol className="flex flex-col">
              {manualQueueUpNext.map((item, index) => (
                <QueueTrack
                  key={item.queueEntryId}
                  track={item}
                  isCurrent={false}
                  isPlaying={false}
                  onClickPlay={() => {
                    handleSeekToManualQueueIndex(index + 1);
                  }}
                />
              ))}
            </ol>
          </li>
        )}
        {hasMainQueueLoaded && (
          <li className="flex flex-col">
            <div className="flex w-full flex-row justify-between p-2">
              <span className="text-sm font-semibold">{t`Next from: ${queueFromLabel}`}</span>
            </div>
            <ol className="flex flex-col">
              {mainQueueUpNext.map((item, index) => (
                <QueueTrack
                  key={index}
                  track={item}
                  isCurrent={false}
                  isPlaying={false}
                  onClickPlay={() => handleTrackClick(queueIndex + index + 1)}
                />
              ))}
            </ol>
          </li>
        )}
      </OktoScrollArea>
    </aside>
  );
}
