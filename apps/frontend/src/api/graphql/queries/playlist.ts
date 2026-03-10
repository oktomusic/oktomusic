import { graphql } from "../gql";

export const PLAYLIST_QUERY = graphql(/* GraphQL */ `
  query Playlist($id: String!) {
    playlist(id: $id) {
      id
      name
      description
      visibility
    }
  }
`);
