import { graphql } from "../gql";

export const INDEXING_OVERVIEW_QUERY = graphql(/* GraphQL */ `
  query IndexingOverview {
    indexingOverview {
      libraryStats {
        generatedAt
        usersCount
        artistsCount
        albumsCount
        tracksCount
        flacFilesCount
        tracksWithLyricsCount
        playlistsCount
        playlistTracksCount
        savedLibraryItemsCount
        playHistoryItemsCount
      }
      latestJob {
        jobId
        status
        progress
        startedAt
        updatedAt
        error
        completedAt
        steps {
          key
          label
          status
          current
          total
          detail
        }
        reports {
          id
          level
          type
          message
          path
          details
          emittedAt
        }
      }
    }
  }
`);
