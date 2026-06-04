import { useCallback, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { Button } from "@base-ui/react/button";
import { Field } from "@base-ui/react/field";
import { Fieldset } from "@base-ui/react/fieldset";
import { t } from "@lingui/core/macro";
import { useAtom, useAtomValue } from "jotai";
import {
  LuGlobe,
  LuLink,
  LuLock,
  LuMusic,
  LuLoaderCircle,
} from "react-icons/lu";

import { dialogPlaylistOpenAtom } from "../../atoms/app/dialogs";
import { authSessionAtom } from "../../atoms/auth/atoms";
import { PlaylistVisibility } from "../../api/graphql/gql/graphql";
import { SEARCH_MY_PLAYLISTS_QUERY } from "../../api/graphql/queries/searchMyPlaylists";
import { CREATE_PLAYLIST_MUTATION } from "../../api/graphql/mutations/playlists/createPlaylist";
import { UPDATE_PLAYLIST_MUTATION } from "../../api/graphql/mutations/playlists/updatePlaylist";
import { PLAYLIST_QUERY } from "../../api/graphql/queries/playlist";
import { USER_PROFILE_QUERY } from "../../api/graphql/queries/userProfile";
import { OktoDialog } from "../Base/OktoDialog";
import { OktoInput } from "../Base/OktoInput";
import { OktoTextarea } from "../Base/OktoTextarea";
import { OktoButton } from "../Base/OktoButton";
import { OktoListbox, OktoListboxItem } from "../Base/OktoListbox";

type VisibilityOptions = "public" | "unlisted" | "private";

const visibilityEnumByOption = {
  public: PlaylistVisibility.Public,
  unlisted: PlaylistVisibility.Unlisted,
  private: PlaylistVisibility.Private,
} satisfies Record<VisibilityOptions, PlaylistVisibility>;

export function DialogPlaylistEdit() {
  const [open, setOpen] = useAtom(dialogPlaylistOpenAtom);
  const authSession = useAtomValue(authSessionAtom);
  const userId = authSession.user!.id;
  const editPlaylistId = typeof open === "string" ? open : null;

  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState<string | null>(null);
  const [visibilityDraft, setVisibilityDraft] =
    useState<VisibilityOptions | null>(null);
  const [loading, setLoading] = useState(false);

  const visibilityOptions: readonly OktoListboxItem<VisibilityOptions>[] = [
    { value: "public", label: t`Public`, icon: LuGlobe },
    { value: "unlisted", label: t`Unlisted`, icon: LuLink },
    { value: "private", label: t`Private`, icon: LuLock },
  ];

  const [createPlaylist] = useMutation(CREATE_PLAYLIST_MUTATION);
  const [updatePlaylist] = useMutation(UPDATE_PLAYLIST_MUTATION);

  const { data: playlistData } = useQuery(PLAYLIST_QUERY, {
    variables: { id: editPlaylistId ?? "" },
    skip: editPlaylistId === null,
  });

  const editPlaylistCreatorId = playlistData?.playlist?.creator.id;

  const isEdit = typeof open === "string";

  const initialVisibility: VisibilityOptions =
    playlistData?.playlist.visibility === PlaylistVisibility.Public
      ? "public"
      : playlistData?.playlist.visibility === PlaylistVisibility.Unlisted
        ? "unlisted"
        : "private";

  const name = nameDraft ?? (isEdit ? (playlistData?.playlist.name ?? "") : "");
  const description =
    descriptionDraft ??
    (isEdit ? (playlistData?.playlist.description ?? "") : "");
  const visibility = visibilityDraft ?? initialVisibility;

  const resetForm = useCallback(() => {
    setNameDraft(null);
    setDescriptionDraft(null);
    setVisibilityDraft(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    setOpen(false);
  }, [resetForm, setOpen]);

  const handleSubmit = useCallback(
    (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);

      const visibilityEnumValue = visibilityEnumByOption[visibility];

      const payload = {
        name,
        description: description || null,
        visibility: visibilityEnumValue,
      };

      const mutationPromise =
        isEdit && editPlaylistId
          ? updatePlaylist({
              variables: {
                id: editPlaylistId,
                input: payload,
              },
              refetchQueries: [
                {
                  query: SEARCH_MY_PLAYLISTS_QUERY,
                  variables: { name: "" },
                },
                {
                  query: PLAYLIST_QUERY,
                  variables: { id: editPlaylistId },
                },
                {
                  query: USER_PROFILE_QUERY,
                  variables: {
                    userId: editPlaylistCreatorId,
                  },
                },
              ],
              awaitRefetchQueries: true,
            })
          : createPlaylist({
              variables: {
                input: payload,
              },
              refetchQueries: [
                {
                  query: SEARCH_MY_PLAYLISTS_QUERY,
                  variables: { name: "" },
                },
                {
                  query: USER_PROFILE_QUERY,
                  variables: {
                    userId,
                  },
                },
              ],
              awaitRefetchQueries: true,
            });

      mutationPromise
        .then(() => {
          resetForm();
          setOpen(false);
        })
        .catch((error) => {
          console.error(
            isEdit
              ? "Failed to update playlist:"
              : "Failed to create playlist:",
            error,
          );
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [
      visibility,
      name,
      description,
      isEdit,
      editPlaylistId,
      updatePlaylist,
      editPlaylistCreatorId,
      createPlaylist,
      userId,
      resetForm,
      setOpen,
    ],
  );

  return (
    <OktoDialog
      open={open !== false}
      onClose={handleClose}
      title={isEdit ? t`Edit playlist details` : t`Create playlist`}
      showHeader={true}
      transparentPanel={false}
      className="w-lg"
    >
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
        <div className="flex flex-1 gap-4">
          <Button
            type="button"
            className="flex size-48 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-white focus:outline-white/25 focus-visible:outline-2 focus-visible:-outline-offset-2"
            title={t`Playlist cover`}
          >
            <LuMusic size={64} />
          </Button>
          <Fieldset.Root className="flex flex-1 flex-col gap-4">
            <Field.Root className="flex flex-col items-start gap-1">
              <Field.Label className="sr-only text-sm/6 font-medium text-white">
                {t`Name`}
              </Field.Label>
              <OktoInput
                id="dialog-playlist:name"
                type="text"
                placeholder={t`Add a name`}
                minLength={1}
                value={name}
                onChange={(e) => setNameDraft(e.target.value)}
                className="w-full"
                autoComplete="off"
              />
            </Field.Root>

            <Field.Root className="flex flex-1 flex-col items-start gap-1">
              <Field.Label className="sr-only text-sm/6 font-medium text-white">
                {t`Description`}
              </Field.Label>
              <OktoTextarea
                id="dialog-playlist:description"
                value={description}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                placeholder={t`Add an optional description`}
                className="w-full flex-1"
              />
            </Field.Root>
          </Fieldset.Root>
        </div>
        <div className="flex justify-between">
          <OktoListbox
            value={visibility}
            onChange={setVisibilityDraft}
            options={visibilityOptions}
            className="w-48"
          />
          <OktoButton type="submit" disabled={loading} className="relative">
            <div
              className={
                "flex items-center justify-center" +
                (loading ? " text-transparent!" : "")
              }
            >
              {loading ? (
                <LuLoaderCircle className="absolute mx-auto size-4 animate-spin text-white!" />
              ) : null}
              {t`Save`}
            </div>
          </OktoButton>
        </div>
      </form>
    </OktoDialog>
  );
}
