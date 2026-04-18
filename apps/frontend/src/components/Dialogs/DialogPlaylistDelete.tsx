import { useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { useAtom } from "jotai";
import { t } from "@lingui/core/macro";
import { useNavigate } from "react-router";

import { DELETE_PLAYLIST_MUTATION } from "../../api/graphql/mutations/playlists/deletePlaylist";
import { USER_PROFILE_QUERY } from "../../api/graphql/queries/userProfile";
import { dialogPlaylistDeleteOpenAtom } from "../../atoms/app/dialogs";
import { OktoButton } from "../Base/OktoButton";
import { OktoDialog } from "../Base/OktoDialog";
import { usePanelToast } from "../../hooks/use_panel_toast";

export function DialogPlaylistDelete() {
  const [open, setOpen] = useAtom(dialogPlaylistDeleteOpenAtom);
  const setToast = usePanelToast();
  const navigate = useNavigate();

  const [deletePlaylist, { loading: deletePlaylistLoading }] = useMutation(
    DELETE_PLAYLIST_MUTATION,
  );

  const handleClose = useCallback(() => {
    setOpen(null);
  }, [setOpen]);

  const handleDelete = useCallback(() => {
    if (open === null) {
      return;
    }

    const playlistId = open.id;
    const creatorId = open.creator.id;

    void deletePlaylist({
      variables: {
        id: playlistId,
      },
      update: (cache) => {
        cache.evict({
          id: cache.identify({ __typename: "Playlist", id: playlistId }),
        });
        cache.evict({
          id: "ROOT_QUERY",
          fieldName: "playlist",
          args: { id: playlistId },
        });
        cache.gc();
      },
      refetchQueries: [
        {
          query: USER_PROFILE_QUERY,
          variables: {
            userId: creatorId,
          },
        },
      ],
      awaitRefetchQueries: true,
    })
      .then(() => {
        setToast({
          type: "success",
          message: t`Playlist deleted`,
        });
        setOpen(null);
        void navigate("/");
      })
      .catch((error) => {
        console.error("Failed to delete playlist:", error);
        setToast({
          type: "error",
          message: t`Failed to delete playlist`,
        });
      });
  }, [deletePlaylist, navigate, open, setOpen, setToast]);

  return (
    <OktoDialog
      open={open !== null}
      onClose={handleClose}
      title={t`Delete playlist?`}
      showHeader={true}
      transparentPanel={false}
      className="w-lg"
    >
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="space-y-1">
            <p className="font-bold text-white">{open?.name ?? ""}</p>
          </div>
          <div className="space-y-1">
            <p className="text-zinc-400">{open?.description ?? ""}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <p className="mr-auto text-sm text-zinc-400">
            {t`This action cannot be undone.`}
          </p>
          <OktoButton
            type="button"
            onClick={handleClose}
            disabled={deletePlaylistLoading}
            className="h-9"
          >
            {t`Cancel`}
          </OktoButton>
          <OktoButton
            type="button"
            onClick={handleDelete}
            disabled={deletePlaylistLoading || open === null}
            className="h-9 bg-red-400/20! hover:bg-red-300/20!"
          >
            {t`Delete`}
          </OktoButton>
        </div>
      </div>
    </OktoDialog>
  );
}
