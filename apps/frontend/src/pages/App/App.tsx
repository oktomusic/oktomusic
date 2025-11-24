import { useEffect, useState } from "react";
import { useLingui } from "@lingui/react/macro";
import { useAtom, useAtomValue } from "jotai";
import { Link } from "react-router";
import { useQuery } from "@apollo/client/react";

import type { ApiInfoRes } from "@oktomusic/api-schemas";

import { getInfo } from "../../api/axios/endpoints/info";
import { authSessionAtom } from "../../atoms/auth/atoms";
import { pipOpenAtom } from "../../atoms/player/pip";
import { ME_QUERY } from "../../api/graphql/queries/me";
import { Role } from "../../api/graphql/gql/graphql";
import IndexingControl from "../../components/IndexingControl/IndexingControl";

import "./App.css";

function App() {
  const { t } = useLingui();

  const [status, setStatus] = useState<ApiInfoRes | undefined>(undefined);
  const authSession = useAtomValue(authSessionAtom);

  const [pipOpen, setPipOpen] = useAtom(pipOpenAtom);

  const { data: userData } = useQuery(ME_QUERY, {
    skip: authSession.status !== "authenticated",
  });

  const isAdmin = userData?.me?.role === Role.Admin;

  useEffect(() => {
    getInfo()
      .then((res) => setStatus(res))
      .catch(console.error);
  }, []);

  if (authSession.status !== "authenticated" || !authSession.user) {
    return null;
  }

  return (
    <>
      <div className="card">
        <p>{JSON.stringify(status, null, 2)}</p>

        <div className="m-4 flex flex-col gap-2">
          <div>
            <p style={{ color: "green" }}>
              ✓ Logged in as {authSession.user.username}
            </p>
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
            <Link to="/settings/account">Account Settings</Link>
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
          {isAdmin && (
            <div className="mt-4">
              <IndexingControl />
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
