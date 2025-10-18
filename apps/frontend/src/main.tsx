import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";

import { dynamicActivate } from "./utils/i18n_loader.ts";
import { getLanguage } from "./utils/get_language.ts";

import "./index.css";
import App from "./App.tsx";

// Determine and activate the user's language
const selectedLanguage = getLanguage();
await dynamicActivate(selectedLanguage);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider i18n={i18n}>
      <BrowserRouter>
        <Routes>
          <Route index element={<App />} />
          <Route path="*" element={<span>404</span>} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  </StrictMode>,
);
