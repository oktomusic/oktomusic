import { graphql } from "../../gql";

export const CREATE_PLAYLIST_MUTATION = graphql(/* GraphQL */ `
  mutation CreatePlaylist($input: CreatePlaylistInput!) {
    createPlaylist(input: $input) {
      id
      name
      description
      visibility
      createdAt
      updatedAt
      tracks {
        position
        addedAt
        track {
          id
          name
          durationMs
        }
      }
    }
  }
`);
