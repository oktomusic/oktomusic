import { useAtomValue } from "jotai";
import { Link } from "react-router";
import { useQuery } from "@apollo/client/react";

import { authSessionAtom } from "../../atoms/auth/atoms";
import { ME_QUERY } from "../../api/graphql/queries/me";
import { Role } from "../../api/graphql/gql/graphql";
import IndexingControl from "../../components/IndexingControl/IndexingControl";
import TempLoadAlbum from "../../components/TempLoadAlbum";

import "./Home.css";
import toast from "react-hot-toast";

function Home() {
  const authSession = useAtomValue(authSessionAtom);

  const { data: userData } = useQuery(ME_QUERY, {
    skip: authSession.status !== "authenticated",
  });

  const isAdmin = userData?.me?.role === Role.Admin;

  if (authSession.status !== "authenticated" || !authSession.user) {
    return null;
  }

  return (
    <>
      <div className="card">
        <div className="m-4 flex flex-col gap-2">
          <TempLoadAlbum />
          <div>
            <p style={{ color: "green" }}>
              ✓ Logged in as {authSession.user.username}
            </p>
            <Link to="/dashboard">Go to Dashboard</Link>
          </div>
          <div>
            <Link to="/appinfo">App Info</Link>
          </div>
          <div>
            <Link to="/settings/account">Account Settings</Link>
          </div>
          <div>
            <Link to="/settings/client">Client Settings</Link>
          </div>
          {isAdmin && (
            <div className="mt-4">
              <IndexingControl />
            </div>
          )}
          <button
            className="bg-zinc-700"
            onClick={() => {
              toast.success("Hello World", { duration: 10000 });
            }}
          >
            Toast
          </button>
        </div>
      </div>
      <div className="flex-1"></div>
    </>
  );
}

export default Home;
