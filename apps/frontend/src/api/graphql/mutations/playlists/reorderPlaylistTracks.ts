import { graphql } from "../../gql";

export const REORDER_PLAYLIST_TRACKS_MUTATION = graphql(/* GraphQL */ `
  mutation ReorderPlaylistTracks(
    $id: String!
    $fromPosition: Int!
    $toPosition: Int!
    $count: Int
  ) {
    reorderPlaylistTracks(
      id: $id
      fromPosition: $fromPosition
      toPosition: $toPosition
      count: $count
    )
  }
`);
