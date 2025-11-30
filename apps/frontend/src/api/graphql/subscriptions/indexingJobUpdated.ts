import { graphql } from "../gql";

export const INDEXING_JOB_UPDATED_SUBSCRIPTION = graphql(/* GraphQL */ `
  subscription IndexingJobUpdated($jobId: String!) {
    indexingJobUpdated(jobId: $jobId) {
      jobId
      status
      progress
      error
      completedAt
      warnings {
        __typename
        ... on IndexingErrorMetaflacParsing {
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
