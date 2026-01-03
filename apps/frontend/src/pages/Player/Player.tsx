import { useState } from "react";

export default function Player() {
  const [id, setId] = useState("");

  return (
    <div>
      <input type="text" value={id} onChange={(e) => setId(e.target.value)} />
      <audio src={`/api/media/${id}`} controls />
    </div>
  );
}
