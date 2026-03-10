import { graphql } from "../gql";

export const UPDATE_PLAYLIST_MUTATION = graphql(/* GraphQL */ `
  mutation UpdatePlaylist($id: String!, $input: UpdatePlaylistInput!) {
    updatePlaylist(id: $id, input: $input) {
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
