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

export const SEARCH_MUSIC_QUERY = graphql(/* GraphQL */ `
  query SearchMusic($input: SearchMusicInput!) {
    search(input: $input) {
      tracks {
        id
        name
        flacFileId
        hasLyrics
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
      artists {
        id
        name
      }
      playlists {
        id
        name
        description
        visibility
        creator {
          id
          username
        }
      }
    }
  }
`);
