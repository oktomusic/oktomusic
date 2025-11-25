import { graphql } from "../gql";

export const USER_PROFILE_QUERY = graphql(/* GraphQL */ `
  query UserProfile($userId: String!) {
    userProfile(userId: $userId) {
      id
      username
      role
      sex
      createdAt
      updatedAt
    }
  }
`);
