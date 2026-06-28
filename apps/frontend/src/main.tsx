import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DevTools } from "jotai-devtools";
import jotaiCSS from "jotai-devtools/styles.css?inline";
import { ApolloProvider } from "@apollo/client/react";

import { createApolloClient } from "./api/graphql/client.ts";
import { Router } from "./Router.tsx";

import "./index.css";

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
      <Router />
    </ApolloProvider>
  </StrictMode>,
);
