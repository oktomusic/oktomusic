import { graphql } from "../gql";

export const TRIGGER_INDEXING_MUTATION = graphql(/* GraphQL */ `
  mutation TriggerIndexing {
    triggerIndexing {
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
`);
