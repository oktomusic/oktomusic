import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { useAtomValue } from "jotai";
import { useRegisterSW } from "virtual:pwa-register/react";

import { browserSupportAtom } from "./atoms/app/browser_support.ts";
import { settingClientKioskMode } from "./atoms/app/settings_client.ts";
import AuthSessionInitializer from "./components/AuthSessionInitializer.tsx";
import PipControls from "./components/PipControls/PipControls.tsx";
import ProtectedRoutes from "./components/ProtectedRoutes.tsx";
import WindowControls from "./components/WindowControls.tsx";
import AudioSessionProvider from "./components/Player/AudioSessionProvider.tsx";
import PlayerProvider from "./components/Player/PlayerProvider.tsx";
import MediaSessionProvider from "./components/Player/MediaSessionProvider.tsx";
import App from "./pages/App/App.tsx";
import AppInfo from "./pages/AppInfo/AppInfo.tsx";
import Login from "./pages/Auth/Login.tsx";
import Player from "./pages/Player/Player.tsx";
import SettingsAccount from "./pages/SettingsAccount/SettingsAccount.tsx";
import SettingsClient from "./pages/SettingsClient/SettingsClient.tsx";
import UnsupportedOverlay from "./pages/Unsupported/UnsupportedOverlay.tsx";
import TempLoadAlbum from "./components/TempLoadAlbum.tsx";
import { useScreenWakeLock } from "./hooks/wake_lock.ts";
import { useStoragePersistence } from "./hooks/persistant_storage.ts";
import { usePwaDeferedPrompt } from "./hooks/pwa_prompt.ts";
import { useVibrantColorsProperties } from "./hooks/vibrant_colors.ts";

const swUpdateIntervalMS = 60 * 60 * 1000; // 1 hour

export default function Router() {
  const { supported, missing } = useAtomValue(browserSupportAtom);
  const kioskModeEnabled = useAtomValue(settingClientKioskMode);

  useScreenWakeLock();
  useStoragePersistence();
  usePwaDeferedPrompt();
  useVibrantColorsProperties();

  useRegisterSW({
    immediate: true,
    onRegisteredSW(_, registration) {
      if (!registration) return;

      setInterval(() => {
        void registration.update();
      }, swUpdateIntervalMS);
    },
  });

  useEffect(() => {
    if (!kioskModeEnabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const isEscape = event.key === "Escape";
      const isCtrlQ = event.ctrlKey && event.key.toLowerCase() === "q";

      if (!isEscape && !isCtrlQ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      window.alert("To exit kiosk mode, press Alt+F4.");
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown, { capture: true });
    };
  }, [kioskModeEnabled]);

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
            <PlayerProvider />
            <MediaSessionProvider />
            <AudioSessionProvider />
            <TempLoadAlbum />
            <Routes>
              <Route element={<ProtectedRoutes />}>
                <Route index element={<App />} />
                <Route path="/appinfo" element={<AppInfo />} />
                <Route path="/player" element={<Player />} />
                <Route path="/settings/account" element={<SettingsAccount />} />
                <Route path="/settings/client" element={<SettingsClient />} />
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
