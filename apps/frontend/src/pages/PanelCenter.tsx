import { Route, Routes } from "react-router";

import ProtectedRoutes from "../components/ProtectedRoutes";
import AdminRoute from "../components/AdminRoute";

import Home from "./Home/Home";
import AppInfo from "./AppInfo/AppInfo";
import { SettingsAccount } from "./SettingsAccount/SettingsAccount";
import { SettingsClient } from "./SettingsClient/SettingsClient";
import { SettingsAdmin } from "./SettingsAdmin/SettingsAdmin";
import { Search } from "./Center/Search";
import { Album } from "./Album/Album";
import { Artist } from "./Center/Artist";

export function PanelCenter() {
  return (
    <main
      id="oktomusic:panel-center"
      className="overflow-y-auto rounded bg-zinc-900"
    >
      <Routes>
        <Route element={<ProtectedRoutes />}>
          <Route index element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/appinfo" element={<AppInfo />} />
          <Route path="/album/:cuid" element={<Album />} />
          <Route path="/artist/:cuid" element={<Artist />} />
          <Route path="/settings/account" element={<SettingsAccount />} />
          <Route path="/settings/client" element={<SettingsClient />} />
          <Route element={<AdminRoute />}>
            <Route path="/settings/admin" element={<SettingsAdmin />} />
          </Route>
        </Route>
      </Routes>
    </main>
  );
}
