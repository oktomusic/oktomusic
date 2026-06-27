import { graphql } from "../gql";

export const INDEXING_JOB_UPDATED_SUBSCRIPTION = graphql(/* GraphQL */ `
  subscription IndexingJobUpdated($jobId: String!) {
    indexingJobUpdated(jobId: $jobId) {
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
      warnings {
        __typename
        ... on IndexingErrorMetaflacParsing {
          type
          filePath
          errorMessage
        }
        ... on IndexingErrorLyricsParsing {
          type
          filePath
          errorMessage
        }
        ... on IndexingWarningSubdirectories {
          type
          dirPath
        }
        ... on IndexingWarningFolderMetadata {
          type
          folderPath
          messages
        }
      }
    }
  }
`);
