import { Route, Routes } from "react-router";

import ProtectedRoutes from "../components/ProtectedRoutes";

import Home from "./Home/Home";
import AppInfo from "./AppInfo/AppInfo";
import Player from "./Player/Player";
import Album from "./Album/Album";
import SettingsAccount from "./SettingsAccount/SettingsAccount";
import SettingsClient from "./SettingsClient/SettingsClient";

export function PanelCenter() {
  return (
    <main
      id="oktomusic:panel-center"
      className="overflow-y-auto rounded bg-zinc-900"
    >
      <Routes>
        <Route element={<ProtectedRoutes />}>
          <Route index element={<Home />} />
          <Route path="/appinfo" element={<AppInfo />} />
          <Route path="/player" element={<Player />} />
          <Route path="/album/:cuid" element={<Album />} />
          <Route path="/settings/account" element={<SettingsAccount />} />
          <Route path="/settings/client" element={<SettingsClient />} />
        </Route>
      </Routes>
    </main>
  );
}
