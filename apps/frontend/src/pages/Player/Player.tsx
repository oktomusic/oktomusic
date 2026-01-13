import { useAtomValue } from "jotai";
import { useState } from "react";
import { playerQueueAtom } from "../../atoms/player/machine";

export default function Player() {
  const [id, setId] = useState("");

  const queueTracks = useAtomValue(playerQueueAtom);

  return (
    <div>
      <input type="text" value={id} onChange={(e) => setId(e.target.value)} />
      <audio src={`/api/media/${id}`} controls className="sr-only" />

      <h2>Queue Tracks:</h2>
      <ol>
        {queueTracks.map((track, index) => (
          <li key={track.id}>
            {index + 1}. {track.name} by{" "}
            {track.artists.map((artist) => artist.name).join(", ")}
          </li>
        ))}
      </ol>
    </div>
  );
}
