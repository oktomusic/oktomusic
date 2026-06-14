import { graphql } from "../gql";

export const PLAYLIST_QUERY = graphql(/* GraphQL */ `
  query Playlist($id: String!) {
    playlist(id: $id) {
      id
      name
      isInLibrary
      description
      visibility
      creator {
        id
        username
      }
      coverAlbumIds
      tracks {
        position
        addedAt
        track {
          id
          flacFileId
          hasLyrics
          name
          trackNumber
          discNumber
          durationMs
          artists {
            id
            name
          }
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
