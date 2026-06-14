import { graphql } from "../gql";

export const REMOVE_LIBRARY_ITEM_MUTATION = graphql(/* GraphQL */ `
  mutation RemoveLibraryItem($input: LibraryItemRefInput!) {
    removeLibraryItem(input: $input)
  }
`);
