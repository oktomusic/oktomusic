import { graphql } from "../../gql";

export const DELETE_PLAYLIST_MUTATION = graphql(/* GraphQL */ `
  mutation DeletePlaylist($id: String!) {
    deletePlaylist(id: $id)
  }
`);
