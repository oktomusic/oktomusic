import { useAtomValue } from "jotai";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import { browserSupportAtom } from "./atoms/app/browser_support.ts";
import AuthSessionInitializer from "./components/AuthSessionInitializer.tsx";
import PipControls from "./components/PipControls.tsx";
import ProtectedRoutes from "./components/ProtectedRoutes.tsx";
import WindowControls from "./components/WindowControls.tsx";
import App from "./pages/App/App.tsx";
import AppInfo from "./pages/AppInfo/AppInfo.tsx";
import Login from "./pages/Auth/Login.tsx";
import Player from "./pages/Player/Player.tsx";
import SettingsAccount from "./pages/SettingsAccount/SettingsAccount.tsx";
import UnsupportedOverlay from "./pages/Unsupported/UnsupportedOverlay.tsx";

export default function Router() {
  const { supported, missing } = useAtomValue(browserSupportAtom);
  return (
    <>
      <AuthSessionInitializer />
      <WindowControls />
      <PipControls />
      <main id="app-shell">
        {!supported ? (
          <UnsupportedOverlay missing={missing} />
        ) : (
        <BrowserRouter>
          <Routes>
            <Route element={<ProtectedRoutes />}>
              <Route index element={<App />} />
              <Route path="/appinfo" element={<AppInfo />} />
              <Route path="/player" element={<Player />} />
              <Route path="/settings/account" element={<SettingsAccount />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        )}
      </main>
    </>
  );
}
