import { useMutation } from "@apollo/client/react";
import { useLingui } from "@lingui/react/macro";
import { useCallback } from "react";

import { ADD_LIBRARY_ITEM_MUTATION } from "../api/graphql/mutations/addLibraryItem";
import { REMOVE_LIBRARY_ITEM_MUTATION } from "../api/graphql/mutations/removeLibraryItem";
import { LibraryItemType } from "../api/graphql/gql/graphql";
import { ALBUM_QUERY } from "../api/graphql/queries/album";
import { MY_LIBRARY_QUERY } from "../api/graphql/queries/myLibrary";
import { PLAYLIST_QUERY } from "../api/graphql/queries/playlist";
import { usePanelToast } from "./use_panel_toast";

interface UseLibraryItemToggleOptions {
  readonly itemId: string;
  readonly itemType: LibraryItemType;
  readonly isInLibrary: boolean;
  readonly disabled?: boolean;
}

export function useLibraryItemToggle(options: UseLibraryItemToggleOptions) {
  const { t } = useLingui();

  const setToast = usePanelToast();
  const [addLibraryItem, addLibraryItemState] = useMutation(
    ADD_LIBRARY_ITEM_MUTATION,
  );
  const [removeLibraryItem, removeLibraryItemState] = useMutation(
    REMOVE_LIBRARY_ITEM_MUTATION,
  );

  const loading = addLibraryItemState.loading || removeLibraryItemState.loading;

  const toggleLibraryItem = useCallback(() => {
    if (options.disabled === true || loading || options.itemId.length === 0) {
      return;
    }

    const input = {
      itemId: options.itemId,
      itemType: options.itemType,
    };

    const detailQuery =
      options.itemType === LibraryItemType.Album
        ? {
            query: ALBUM_QUERY,
            variables: { id: options.itemId },
          }
        : {
            query: PLAYLIST_QUERY,
            variables: { id: options.itemId },
          };

    const mutation = options.isInLibrary ? removeLibraryItem : addLibraryItem;

    void mutation({
      variables: { input },
      refetchQueries: [{ query: MY_LIBRARY_QUERY }, detailQuery],
      awaitRefetchQueries: false,
    }).catch((error: unknown) => {
      console.error("Failed to update library item:", error);

      setToast({
        message: options.isInLibrary
          ? t`Failed to remove from library`
          : t`Failed to save to library`,
        type: "error",
      });
    });
  }, [
    addLibraryItem,
    loading,
    options.disabled,
    options.isInLibrary,
    options.itemId,
    options.itemType,
    removeLibraryItem,
    setToast,
    t,
  ]);

  return {
    loading,
    toggleLibraryItem,
  };
}
