import { graphql } from "../gql";

export const RECORD_ITEM_PLAY_MUTATION = graphql(/* GraphQL */ `
  mutation RecordItemPlay($itemType: LibraryItemType!, $itemId: String!) {
    recordItemPlay(itemType: $itemType, itemId: $itemId)
  }
`);
