import { useAtomValue } from "jotai";
import { networkStatusAtom } from "../../atoms/app/atoms";

function AppInfo() {
  const isOnline = useAtomValue(networkStatusAtom);

  return (
    <div>
      <ul>
        <li>
          <strong>Network Status:</strong> {isOnline ? "Online" : "Offline"}
        </li>
      </ul>
    </div>
  );
}

export default AppInfo;
