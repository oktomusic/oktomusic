import { Route, Routes } from "react-router";

import { AdminRoute } from "../components/AdminRoute";
import { OktoScrollArea } from "../components/Base/OktoScrollArea";
import { ProtectedRoutes } from "../components/ProtectedRoutes";
import { AppInfo } from "./AppInfo/AppInfo";
import { Album } from "./Center/Album";
import { Artist } from "./Center/Artist";
import { Generic404 } from "./Center/Generic404";
import { Home } from "./Center/Home";
import { Playlist } from "./Center/Playlist";
import { Search } from "./Center/Search";
import { User } from "./Center/User";
import { SettingsAccount } from "./SettingsAccount/SettingsAccount";
import { SettingsAdmin } from "./SettingsAdmin/SettingsAdmin";
import { SettingsClient } from "./SettingsClient/SettingsClient";

export function PanelCenter() {
  return (
    <OktoScrollArea id="oktomusic:panel-center" className="rounded bg-zinc-900">
      <Routes>
        <Route element={<ProtectedRoutes />}>
          <Route index element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/appinfo" element={<AppInfo />} />
          <Route path="/album/:cuid" element={<Album />} />
          <Route path="/playlist/:cuid" element={<Playlist />} />
          <Route path="/artist/:cuid" element={<Artist />} />
          <Route path="/user/:cuid" element={<User />} />
          <Route path="/settings/account" element={<SettingsAccount />} />
          <Route path="/settings/client" element={<SettingsClient />} />
          <Route element={<AdminRoute />}>
            <Route path="/settings/admin" element={<SettingsAdmin />} />
          </Route>
          <Route path="*" element={<Generic404 />} />
        </Route>
      </Routes>
    </OktoScrollArea>
  );
}
