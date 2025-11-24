import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useLingui } from "@lingui/react/macro";
import { useAtom } from "jotai";

import type { ApiInfoRes } from "@oktomusic/api-schemas";
import { getInfo } from "../../api/axios/endpoints/info";
import { getSession } from "../../api/axios/endpoints/auth";
import { authSessionAtom } from "../../atoms/auth/atoms";
import { pipOpenAtom } from "../../atoms/player/pip";

import "./App.css";

function App() {
  const { t } = useLingui();

  const [status, setStatus] = useState<ApiInfoRes | undefined>(undefined);
  const [authSession, setAuthSession] = useAtom(authSessionAtom);

  const [pipOpen, setPipOpen] = useAtom(pipOpenAtom);

  useEffect(() => {
    getInfo()
      .then((res) => setStatus(res))
      .catch(console.error);

    // Check session status
    getSession()
      .then((session) => setAuthSession(session))
      .catch(console.error);
  }, [setAuthSession]);

  return (
    <>
      <div className="card">
        <p>{JSON.stringify(status, null, 2)}</p>

        <div className="m-4 flex flex-col gap-2">
          {authSession.authenticated ? (
            <>
              <div>
                <p style={{ color: "green" }}>✓ Logged in</p>
                <Link to="/dashboard">Go to Dashboard</Link>
              </div>
              <div>
                <Link to="/player">Player</Link>
              </div>
              <div>
                <a href="/api/auth/logout">Logout</a>
              </div>
              <div>
                <Link to="/appinfo">App Info</Link>
              </div>
              <div>
                <button
                  onClick={() => {
                    setPipOpen(!pipOpen);
                  }}
                  className="bg-blue-300"
                >
                  {pipOpen ? "Close PiP Controls" : "Open PiP Controls"}
                </button>
              </div>
            </>
          ) : (
            <div>
              <p>Not logged in</p>
              <Link to="/login">Login</Link>
            </div>
          )}
        </div>
      </div>
      <p className="read-the-docs">
        {t`Click on the Vite and React logos to learn more`}
      </p>
    </>
  );
}

export default App;
