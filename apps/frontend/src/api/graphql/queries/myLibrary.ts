import { graphql } from "../gql";

export const MY_LIBRARY_QUERY = graphql(/* GraphQL */ `
  query MyLibrary {
    myLibrary {
      items {
        id
        itemType
        itemId
        source
        addedAt
        lastPlayedAt
        item {
          __typename
          ... on AlbumBasic {
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
          ... on PlaylistBasic {
            id
            name
            description
            visibility
            creator {
              id
              username
            }
            coverAlbumIds
          }
        }
      }
    }
  }
`);
