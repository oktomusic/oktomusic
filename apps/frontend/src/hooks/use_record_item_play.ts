import { useMutation } from "@apollo/client/react";
import { useCallback } from "react";

import { LibraryItemType } from "../api/graphql/gql/graphql";
import { RECORD_ITEM_PLAY_MUTATION } from "../api/graphql/mutations/recordItemPlay";
import { MY_LIBRARY_QUERY } from "../api/graphql/queries/myLibrary";
import { type PlayerQueueFrom } from "../atoms/player/machine";

type RecordableLibraryItem = Pick<PlayerQueueFrom, "id" | "type">;

export function useRecordItemPlay() {
  const [recordItemPlay] = useMutation(RECORD_ITEM_PLAY_MUTATION);

  return useCallback(
    (item: RecordableLibraryItem) => {
      const itemType =
        item.type === "album"
          ? LibraryItemType.Album
          : LibraryItemType.Playlist;

      void recordItemPlay({
        variables: {
          itemId: item.id,
          itemType,
        },
        refetchQueries: [{ query: MY_LIBRARY_QUERY }],
        awaitRefetchQueries: false,
      }).catch((error: unknown) => {
        console.error("Failed to record item play:", error);
      });
    },
    [recordItemPlay],
  );
}
