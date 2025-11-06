import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { DevTools } from "jotai-devtools";
import jotaiCSS from "jotai-devtools/styles.css?inline";

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";

import { dynamicActivate } from "./utils/i18n_loader.ts";
import { getLanguage } from "./utils/get_language.ts";

import "./index.css";
import App from "./pages/App/App.tsx";
import AppInfo from "./pages/AppInfo/AppInfo.tsx";
import Login from "./pages/Auth/Login.tsx";

// Determine and activate the user's language
const selectedLanguage = getLanguage();
await dynamicActivate(selectedLanguage);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {import.meta.env.DEV ? (
      <>
        <style>{jotaiCSS}</style>
        <DevTools />
      </>
    ) : null}
    <I18nProvider i18n={i18n}>
      <BrowserRouter>
        <Routes>
          <Route index element={<App />} />
          <Route path="/appinfo" element={<AppInfo />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<span>404</span>} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  </StrictMode>,
);
