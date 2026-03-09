import { useState } from "react";
import { useAtom } from "jotai";
import { Button, Field, Fieldset, Label } from "@headlessui/react";
import { t } from "@lingui/core/macro";
import {
  LuGlobe,
  LuLink,
  LuLock,
  LuMusic,
  LuLoaderCircle,
} from "react-icons/lu";

import { dialogPlaylistOpenAtom } from "../../atoms/app/dialogs";
import { OktoDialog } from "../Base/OktoDialog";
import { OktoInput } from "../Base/OktoInput";
import { OktoTextarea } from "../Base/OktoTextarea";
import { OktoButton } from "../Base/OktoButton";
import { OktoListbox, OktoListboxOption } from "../Base/OktoListbox";

export function DialogPlaylistEdit() {
  const [open, setOpen] = useAtom(dialogPlaylistOpenAtom);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  type VisibilityOptions = "public" | "unlisted" | "private";

  const [visibility, setVisibility] = useState<VisibilityOptions>("private");

  const visibilityOptions: Record<VisibilityOptions, OktoListboxOption> = {
    public: { label: t`Public`, icon: LuGlobe },
    unlisted: { label: t`Unlisted`, icon: LuLink },
    private: { label: t`Private`, icon: LuLock },
  };

  const isEdit = true;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Name:", name);
    console.log("Description:", description);
    console.log("Visibility:", visibility);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <OktoDialog
      open={open}
      onClose={() => setOpen(false)}
      title={isEdit ? t`Edit playlist details` : t`Create playlist`}
      showHeader={true}
      transparentPanel={false}
      className="w-lg"
    >
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
        <div className="flex flex-1 gap-4">
          <Button
            type="button"
            className="flex size-48 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-white data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
            title={t`Playlist cover`}
          >
            <LuMusic size={64} />
          </Button>
          <Fieldset className="flex flex-1 flex-col gap-4">
            <Field>
              <Label className="sr-only text-sm/6 font-medium text-white">{t`Name`}</Label>
              <OktoInput
                id="dialog-playlist:name"
                type="text"
                minLength={1}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t`Add a name`}
                className="w-full"
                autoComplete="off"
              />
            </Field>
            <Field className="flex flex-1 flex-col">
              <Label className="sr-only text-sm/6 font-medium text-white">{t`Description`}</Label>
              <OktoTextarea
                id="dialog-playlist:description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t`Add an optional description`}
                className="w-full flex-1"
              />
            </Field>
          </Fieldset>
        </div>
        <div className="flex justify-between">
          <OktoListbox
            value={visibility}
            onChange={setVisibility}
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
              ) : undefined}
              {t`Save`}
            </div>
          </OktoButton>
        </div>
      </form>
    </OktoDialog>
  );
}
