import { graphql } from "../../gql";

export const ADD_TRACKS_TO_PLAYLIST_MUTATION = graphql(/* GraphQL */ `
  mutation AddTracksToPlaylist(
    $id: String!
    $trackIds: [String!]!
    $position: Int
  ) {
    addTracksToPlaylist(id: $id, trackIds: $trackIds, position: $position)
  }
`);
