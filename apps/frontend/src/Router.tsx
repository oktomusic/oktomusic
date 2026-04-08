import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { useAtomValue } from "jotai";

import { authSessionAtom } from "./atoms/auth/atoms.ts";
import { browserSupportAtom } from "./atoms/app/browser_support.ts";

import { useScreenWakeLock } from "./hooks/wake_lock.ts";
import { useStoragePersistence } from "./hooks/persistent_storage.ts";
import { usePwaDeferredPrompt } from "./hooks/pwa_prompt.ts";
import { useKioskExitHandler } from "./hooks/kiosk_exit_handler.ts";
import { useSWRegister } from "./hooks/sw_register.ts";

import AuthSessionInitializer from "./components/AuthSessionInitializer.tsx";
import WindowControls from "./components/WindowControls.tsx";
import Login from "./pages/Auth/Login.tsx";
import UnsupportedOverlay from "./pages/Unsupported/UnsupportedOverlay.tsx";

import { App } from "./App.tsx";

function LoginRedirect() {
  const authSession = useAtomValue(authSessionAtom);

  if (authSession.status !== "unauthenticated") {
    return undefined;
  }
  return <Navigate to="/login" replace />;
}

export default function Router() {
  const { supported, missing } = useAtomValue(browserSupportAtom);

  const authSession = useAtomValue(authSessionAtom);

  useScreenWakeLock();
  useStoragePersistence();
  usePwaDeferredPrompt();
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
              <Route
                path="*"
                Component={
                  authSession.status === "authenticated" ? App : LoginRedirect
                }
              />
            </Routes>
          </BrowserRouter>
        )}
      </main>
    </>
  );
}
