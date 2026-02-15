import { TrackWithAlbum } from "../../atoms/player/machine";
import "./TrackList.css";

interface TrackListProps {
  readonly tracks: TrackWithAlbum[][];
  readonly displayCover?: boolean;
}

export function TrackList(props: TrackListProps) {
  const isMultiDisc = props.tracks.length > 1;

  return (
    <div className="track-list">
      <span>
        {isMultiDisc
          ? `Multi-disc album (${props.tracks.length} discs)`
          : "Single-disc album"}
      </span>
      <pre>{JSON.stringify(props.tracks, null, 2)}</pre>
    </div>
  );
}
