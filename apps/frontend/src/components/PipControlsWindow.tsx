import { useAtomValue } from "jotai";

import { networkStatusAtom } from "../atoms/app/atoms";

export default function PipControlsWindow() {
  const isOnline = useAtomValue(networkStatusAtom);

  return (
    <div className="text-white">
      <strong>Network Status:</strong> {isOnline ? "Online" : "Offline"}
    </div>
  );
}
