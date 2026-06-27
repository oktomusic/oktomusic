import { useAtomValue } from "jotai";
import { Link } from "react-router";

import { authSessionAtom } from "../../atoms/auth/atoms";

export function Home() {
  const authSession = useAtomValue(authSessionAtom);

  if (authSession.status !== "authenticated" || !authSession.user) {
    return null;
  }

  return (
    <>
      <div className="card">
        <div className="m-4 flex flex-col gap-2">
          <div>
            <p className="text-green-600">
              ✓ Logged in as {authSession.user.username}
            </p>
          </div>
          <div>
            <Link to="/appinfo">App Info</Link>
          </div>
        </div>
      </div>
    </>
  );
}
