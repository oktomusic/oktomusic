import { graphql } from "../gql";

export const TRACK_LYRICS_QUERY = graphql(/* GraphQL */ `
  query TrackLyrics($id: String!) {
    track(id: $id) {
      id
      hasLyrics
      lyrics {
        l {
          c
          d
        }
        t
        te
        ts
      }
    }
  }
`);
