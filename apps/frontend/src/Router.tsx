import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { useAtomValue, useSetAtom } from "jotai";

import { App } from "./App.tsx";
import { browserSupportAtom } from "./atoms/app/browser_support.ts";
import {
  applicationLanguageReady,
  bootstrapLocaleAtom,
} from "./atoms/app/language.ts";
import { authSessionAtom } from "./atoms/auth/atoms.ts";
import { AuthSessionInitializer } from "./components/AuthSessionInitializer.tsx";
import { WindowControls } from "./components/WindowControls.tsx";
import { useKioskExitHandler } from "./hooks/kiosk_exit_handler.ts";
import { useStoragePersistence } from "./hooks/persistent_storage.ts";
import { usePwaDeferredPrompt } from "./hooks/pwa_prompt.ts";
import { useSWRegister } from "./hooks/sw_register.ts";
import { useScreenWakeLock } from "./hooks/wake_lock.ts";
import { Login } from "./pages/Auth/Login.tsx";
import { UnsupportedOverlay } from "./pages/Unsupported/UnsupportedOverlay.tsx";

function LoginRedirect() {
  const authSession = useAtomValue(authSessionAtom);

  if (authSession.status !== "unauthenticated") {
    return undefined;
  }
  return <Navigate to="/login" replace />;
}

export function Router() {
  const { supported, missing } = useAtomValue(browserSupportAtom);

  const authSession = useAtomValue(authSessionAtom);

  const languageReady = useAtomValue(applicationLanguageReady);
  const bootstrapLocale = useSetAtom(bootstrapLocaleAtom);

  useScreenWakeLock();
  useStoragePersistence();
  usePwaDeferredPrompt();
  useKioskExitHandler();

  useSWRegister();

  useEffect(() => {
    void bootstrapLocale();
  }, [bootstrapLocale]);

  if (!languageReady) {
    return null;
  }

  return (
    <I18nProvider i18n={i18n}>
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
    </I18nProvider>
  );
}
