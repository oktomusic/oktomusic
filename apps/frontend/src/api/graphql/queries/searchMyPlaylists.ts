import { graphql } from "../gql";

export const SEARCH_MY_PLAYLISTS_QUERY = graphql(/* GraphQL */ `
  query SearchMyPlaylists($name: String!, $limit: Int) {
    searchMyPlaylists(name: $name, limit: $limit) {
      id
      name
      description
    }
  }
`);
