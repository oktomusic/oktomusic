import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useLingui } from "@lingui/react/macro";
import { useAtom } from "jotai";

import type { ApiInfoRes } from "@oktomusic/api-schemas";
import { getInfo } from "../../api/axios/endpoints/info";
import { getSession } from "../../api/axios/endpoints/auth";
import { authSessionAtom } from "../../atoms/auth/atoms";

import reactLogo from "../../assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  const { t } = useLingui();

  const [status, setStatus] = useState<ApiInfoRes | undefined>(undefined);
  const [authSession, setAuthSession] = useAtom(authSessionAtom);

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
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>{JSON.stringify(status, null, 2)}</p>

        <div style={{ marginTop: "20px" }}>
          {authSession.authenticated ? (
            <div>
              <p style={{ color: "green" }}>✓ Logged in</p>
              <Link to="/dashboard">Go to Dashboard</Link>
            </div>
          ) : (
            <div>
              <p>Not logged in</p>
              <Link to="/login">Login</Link>
            </div>
          )}
        </div>

        <Link to="/appinfo">{"App Info"}</Link>
      </div>
      <p className="read-the-docs">
        {t`Click on the Vite and React logos to learn more`}
      </p>
    </>
  );
}

export default App;
