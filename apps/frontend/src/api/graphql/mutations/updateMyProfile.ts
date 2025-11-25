import { graphql } from "../gql";

export const UPDATE_MY_PROFILE_MUTATION = graphql(/* GraphQL */ `
  mutation UpdateMyProfile($input: UpdateUserProfileInput!) {
    updateMyProfile(input: $input) {
      id
      username
      sex
    }
  }
`);
