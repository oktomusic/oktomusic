import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Link } from "react-router";
import { useQuery } from "@apollo/client/react";

import { authSessionAtom } from "../../atoms/auth/atoms";
import { ME_QUERY } from "../../api/graphql/queries/me";
import { Role } from "../../api/graphql/gql/graphql";
import IndexingControl from "../../components/IndexingControl/IndexingControl";
import { dialogPlaylistOpenAtom } from "../../atoms/app/dialogs";
import { OktoButton } from "../../components/Base/OktoButton";
import { OktoInput } from "../../components/Base/OktoInput";

import "./Home.css";

function Home() {
  const authSession = useAtomValue(authSessionAtom);

  const { data: userData } = useQuery(ME_QUERY, {
    skip: authSession.status !== "authenticated",
  });

  const setOpen = useSetAtom(dialogPlaylistOpenAtom);
  const [playlistIdInput, setPlaylistIdInput] = useState("");

  const isAdmin = userData?.me?.role === Role.Admin;

  const handleEditPlaylist = () => {
    if (!playlistIdInput.trim()) {
      return;
    }

    setOpen(playlistIdInput.trim());
    setPlaylistIdInput("");
  };

  if (authSession.status !== "authenticated" || !authSession.user) {
    return null;
  }

  return (
    <>
      <div className="card">
        <div className="m-4 flex flex-col gap-2">
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
          <div className="mt-2 flex flex-col gap-2">
            <OktoButton onClick={() => setOpen(true)} className="w-fit">
              Create Playlist
            </OktoButton>
            <div className="flex max-w-xl items-center gap-2">
              <OktoInput
                id="home:playlist-id"
                type="text"
                value={playlistIdInput}
                onChange={(e) => setPlaylistIdInput(e.target.value)}
                placeholder="Playlist ID"
                autoComplete="off"
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEditPlaylist();
                  }
                }}
              />
              <OktoButton onClick={handleEditPlaylist} className="shrink-0">
                Edit Playlist
              </OktoButton>
            </div>
          </div>
          {isAdmin && (
            <div className="mt-4">
              <IndexingControl />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1"></div>
    </>
  );
}

export default Home;
