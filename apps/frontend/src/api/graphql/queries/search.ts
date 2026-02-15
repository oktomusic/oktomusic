import { graphql } from "../gql";

export const SEARCH_ALBUMS_QUERY = graphql(/* GraphQL */ `
  query SearchAlbums($input: SearchAlbumsInput!) {
    searchAlbums(input: $input) {
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
`);
