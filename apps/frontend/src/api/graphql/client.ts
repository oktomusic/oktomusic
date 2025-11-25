import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { Kind, OperationTypeNode } from "graphql";
import { createClient } from "graphql-ws";

export function createApolloClient() {
  const httpLink = new HttpLink({ uri: "/api/graphql" });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/graphql`,
    }),
  );

  // Split link: use WebSocket for subscriptions, HTTP for everything else
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === Kind.OPERATION_DEFINITION &&
        "operation" in definition &&
        definition.operation === OperationTypeNode.SUBSCRIPTION
      );
    },
    wsLink,
    httpLink,
  );

  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });
}
