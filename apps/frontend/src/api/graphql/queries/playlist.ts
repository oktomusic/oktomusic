import { graphql } from "../gql";

export const PLAYLIST_QUERY = graphql(/* GraphQL */ `
  query Playlist($id: String!) {
    playlist(id: $id) {
      id
      name
      description
      visibility
      creator {
        id
        username
      }
      tracks {
        position
        addedAt
        track {
          id
          name
          durationMs
          album {
            id
            name
            date
            coverColorVibrant
            coverColorDarkVibrant
            coverColorLightVibrant
            coverColorMuted
            coverColorDarkMuted
            coverColorLightMuted
            artists {
              id
              name
            }
          }
        }
      }
    }
  }
`);
