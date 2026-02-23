import { TrackWithAlbum } from "../../atoms/player/machine";
import { TrackElement } from "./TrackElement";

import "./TrackList.css";

interface TrackListProps {
  readonly tracks: TrackWithAlbum[][];
  readonly displayCover?: boolean;
  /**
   * TODO: implement drag-and-drop reordering of tracks when `reorderable` is true.
   */
  readonly reorderable?: boolean;
}

export function TrackList(props: TrackListProps) {
  const isMultiDisc = props.tracks.length > 1;
  const displayCover = props.displayCover !== false;

  return (
    <div className="track-list">
      <nav className="track-list__nav mb-2 grid w-full border-b border-zinc-600 pb-2">
        <span>#</span>
        <span className="border-l border-zinc-600 px-2">Title</span>
        <span className="border-l border-zinc-600 px-2">Duration</span>
      </nav>
      {props.tracks.map((discTracks, discIndex) => (
        <div key={discIndex} className="track-list__disc">
          {isMultiDisc && (
            <h2 className="track-list__disc-title">Disc {discIndex + 1}</h2>
          )}
          <ol className="track-list__tracks">
            {discTracks.map((track, trackIndex) => (
              <TrackElement
                key={trackIndex}
                track={track}
                index={trackIndex}
                displayCover={displayCover}
              />
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
