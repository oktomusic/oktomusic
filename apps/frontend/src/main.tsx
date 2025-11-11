import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DevTools } from "jotai-devtools";
import jotaiCSS from "jotai-devtools/styles.css?inline";

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";

import { dynamicActivate } from "./utils/i18n_loader.ts";
import { getLanguage } from "./utils/get_language.ts";
import Router from "./Router.tsx";

import "./index.css";

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
      <Router />
    </I18nProvider>
  </StrictMode>,
);
