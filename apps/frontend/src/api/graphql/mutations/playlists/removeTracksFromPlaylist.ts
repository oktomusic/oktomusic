import { graphql } from "../../gql";

export const REMOVE_TRACKS_FROM_PLAYLIST_MUTATION = graphql(/* GraphQL */ `
  mutation RemoveTracksFromPlaylist($id: String!, $positions: [Int!]!) {
    removeTracksFromPlaylist(id: $id, positions: $positions)
  }
`);
