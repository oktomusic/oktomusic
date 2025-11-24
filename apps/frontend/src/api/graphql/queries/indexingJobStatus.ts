import { graphql } from "../gql";

export const INDEXING_JOB_STATUS_QUERY = graphql(/* GraphQL */ `
  query IndexingJobStatus($jobId: String!) {
    indexingJobStatus(jobId: $jobId) {
      jobId
      status
      progress
      error
      completedAt
    }
  }
`);
