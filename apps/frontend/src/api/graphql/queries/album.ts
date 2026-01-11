import { graphql } from "../gql";

export const ALBUM_QUERY = graphql(/* GraphQL */ `
  query Album($id: String!) {
    album(id: $id) {
      id
      name
      date
      artists {
        id
        name
      }
      tracksByDisc {
        id
        flacFileId
        name
        trackNumber
        discNumber
        durationMs
        artists {
          id
          name
        }
      }
    }
  }
`);
