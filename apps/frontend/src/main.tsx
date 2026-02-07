import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DevTools } from "jotai-devtools";
import jotaiCSS from "jotai-devtools/styles.css?inline";
import { ApolloProvider } from "@apollo/client/react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";

import { createApolloClient } from "./api/graphql/client.ts";
import { dynamicActivate } from "./utils/i18n_loader.ts";
import { getLanguage } from "./utils/get_language.ts";
import Router from "./Router.tsx";

import "./index.css";

// Determine and activate the user's language
const selectedLanguage = getLanguage();
await dynamicActivate(selectedLanguage);

const apolloClient = createApolloClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {import.meta.env.DEV ? (
      <>
        <style>{jotaiCSS}</style>
        <DevTools position="top-left" />
      </>
    ) : null}
    <ApolloProvider client={apolloClient}>
      <I18nProvider i18n={i18n}>
        <Router />
      </I18nProvider>
    </ApolloProvider>
  </StrictMode>,
);
