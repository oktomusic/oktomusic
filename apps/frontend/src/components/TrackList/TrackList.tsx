import { useCallback, useMemo } from "react";
import { useSetAtom } from "jotai";
import { t } from "@lingui/core/macro";
import { LuDisc3 } from "react-icons/lu";

import {
  TrackWithAlbum,
  replaceQueueAtom,
  handleSeekToQueueIndexAtom,
} from "../../atoms/player/machine";
import { TrackElement } from "./TrackElement";

import "./TrackList.css";

interface TrackListProps {
  readonly tracks: TrackWithAlbum[][];
  readonly displayCover?: boolean;
  /**
   * The ID of the playlist to which tracks can be added or removed.
   *
   * Used to conditionally render "Remove from playlist" menu item.
   */
  readonly playlistId?: string;
  /**
   * TODO: implement drag-and-drop reordering of tracks when `reorderable` is true.
   */
  readonly reorderable?: boolean;
}

export function TrackList(props: TrackListProps) {
  const isMultiDisc = props.tracks.length > 1;
  const displayCover = props.displayCover !== false;

  // Flatten all tracks from all discs into a single array
  const allTracks = useMemo(() => props.tracks.flat(), [props.tracks]);

  const replaceQueue = useSetAtom(replaceQueueAtom);
  const seekToQueueIndex = useSetAtom(handleSeekToQueueIndexAtom);

  const handlePlay = useCallback(
    (globalIndex: number) => {
      replaceQueue(allTracks);
      if (globalIndex > 0) {
        seekToQueueIndex(globalIndex);
      }
    },
    [allTracks, replaceQueue, seekToQueueIndex],
  );

  return (
    <div className="track-list">
      <nav className="track-list__nav mb-2 grid w-full border-b border-zinc-600 pb-2">
        <span className="text-end">#</span>
        <span className="border-zinc-600">Title</span>
        <span className="border-l border-zinc-600 px-2">Duration</span>
      </nav>
      {props.tracks.map((discTracks, discIndex) => {
        // Calculate the starting global index for this disc
        const discStartIndex = props.tracks
          .slice(0, discIndex)
          .reduce((sum, disc) => sum + disc.length, 0);

        const discNumber = discIndex + 1;

        return (
          <div key={discIndex} className="track-list__disc">
            {isMultiDisc && (
              <div className="flex h-14 flex-row items-center gap-4 px-4">
                <LuDisc3 />
                <h2 className="track-list__disc-title font-bold">
                  {t`Disc ${discNumber}`}
                </h2>
              </div>
            )}
            <ol className="track-list__tracks">
              {discTracks.map((track, trackIndex) => (
                <TrackElement
                  key={`${trackIndex}-${track.id}`}
                  track={track}
                  index={trackIndex}
                  displayCover={displayCover}
                  onPlay={() => handlePlay(discStartIndex + trackIndex)}
                  playlistId={props.playlistId}
                  playlistTrackIndex={discStartIndex + trackIndex}
                />
              ))}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
