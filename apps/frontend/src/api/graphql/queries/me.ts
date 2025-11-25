import { graphql } from "../gql";

export const ME_QUERY = graphql(/* GraphQL */ `
  query Me {
    me {
      id
      username
      role
      sex
      createdAt
      updatedAt
    }
  }
`);
