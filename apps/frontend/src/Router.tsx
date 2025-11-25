import { useAtomValue } from "jotai";
import { BrowserRouter, Route, Routes } from "react-router";

import { browserSupportAtom } from "./atoms/app/browser_support.ts";
import PipControls from "./components/PipControls.tsx";
import RequireAuth from "./components/RequireAuth.tsx";
import WindowControls from "./components/WindowControls.tsx";
import App from "./pages/App/App.tsx";
import AppInfo from "./pages/AppInfo/AppInfo.tsx";
import Login from "./pages/Auth/Login.tsx";
import Player from "./pages/Player/Player.tsx";
import UnsupportedOverlay from "./pages/Unsupported/UnsupportedOverlay.tsx";

export default function Router() {
  const { supported, missing } = useAtomValue(browserSupportAtom);
  return (
    <>
      <WindowControls />
      <PipControls />
      <main id="app-shell">
        {!supported ? <UnsupportedOverlay missing={missing} /> : null}
        <BrowserRouter>
          <Routes>
            <Route
              index
              element={
                <RequireAuth>
                  <App />
                </RequireAuth>
              }
            />
            <Route
              path="/appinfo"
              element={
                <RequireAuth>
                  <AppInfo />
                </RequireAuth>
              }
            />
            <Route
              path="/player"
              element={
                <RequireAuth>
                  <Player />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<span>404</span>} />
          </Routes>
        </BrowserRouter>
      </main>
    </>
  );
}
