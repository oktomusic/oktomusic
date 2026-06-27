import { graphql } from "../gql";

export const ARTIST_QUERY = graphql(/* GraphQL */ `
  query Artist($id: String!) {
    artist(id: $id) {
      id
      name
      albums {
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
      featuredOnAlbums {
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
`);
