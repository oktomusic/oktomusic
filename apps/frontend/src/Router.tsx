import { BrowserRouter, Route, Routes } from "react-router";
import { useAtomValue } from "jotai";

import { browserSupportAtom } from "./atoms/app/browser_support.ts";

import { useScreenWakeLock } from "./hooks/wake_lock.ts";
import { useStoragePersistence } from "./hooks/persistant_storage.ts";
import { usePwaDeferedPrompt } from "./hooks/pwa_prompt.ts";
import { useKioskExitHandler } from "./hooks/kiosk_exit_handler.ts";
import { useSWRegister } from "./hooks/sw_register.ts";

import AuthSessionInitializer from "./components/AuthSessionInitializer.tsx";
import WindowControls from "./components/WindowControls.tsx";
import Login from "./pages/Auth/Login.tsx";
import UnsupportedOverlay from "./pages/Unsupported/UnsupportedOverlay.tsx";

import { App } from "./App.tsx";

export default function Router() {
  const { supported, missing } = useAtomValue(browserSupportAtom);

  useScreenWakeLock();
  useStoragePersistence();
  usePwaDeferedPrompt();
  useKioskExitHandler();

  useSWRegister();

  return (
    <>
      <AuthSessionInitializer />
      <WindowControls />
      <main id="app-shell">
        {!supported ? (
          <UnsupportedOverlay missing={missing} />
        ) : (
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<App />} />
            </Routes>
          </BrowserRouter>
        )}
      </main>
    </>
  );
}
