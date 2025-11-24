import { graphql } from "../gql";

export const TRIGGER_INDEXING_MUTATION = graphql(/* GraphQL */ `
  mutation TriggerIndexing {
    triggerIndexing {
      jobId
      status
    }
  }
`);
