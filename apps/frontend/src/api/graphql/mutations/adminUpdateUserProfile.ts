import { graphql } from "../gql";

export const ADMIN_UPDATE_USER_PROFILE_MUTATION = graphql(/* GraphQL */ `
  mutation AdminUpdateUserProfile(
    $userId: String!
    $input: UpdateUserProfileInput!
  ) {
    adminUpdateUserProfile(userId: $userId, input: $input) {
      id
      username
      role
      sex
      updatedAt
    }
  }
`);
