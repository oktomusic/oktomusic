import { useAtomValue } from "jotai";
import { BrowserRouter, Route, Routes } from "react-router";

import { browserSupportAtom } from "./atoms/app/browser_support.ts";
import UnsupportedOverlay from "./pages/Unsupported/UnsupportedOverlay.tsx";
import App from "./pages/App/App.tsx";
import AppInfo from "./pages/AppInfo/AppInfo.tsx";
import Login from "./pages/Auth/Login.tsx";
import Player from "./pages/Player/Player.tsx";

export default function Router() {
  const { supported, missing } = useAtomValue(browserSupportAtom);
  return (
    <div className="">
      {!supported ? <UnsupportedOverlay missing={missing} /> : null}
      <BrowserRouter>
        <Routes>
          <Route index element={<App />} />
          <Route path="/appinfo" element={<AppInfo />} />
          <Route path="/player" element={<Player />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<span>404</span>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
