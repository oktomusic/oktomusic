import { graphql } from "../gql";

export const ADD_LIBRARY_ITEM_MUTATION = graphql(/* GraphQL */ `
  mutation AddLibraryItem($input: LibraryItemRefInput!) {
    addLibraryItem(input: $input) {
      id
      itemType
      itemId
      source
    }
  }
`);
