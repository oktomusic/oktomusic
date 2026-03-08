import { useAtom } from "jotai";
import { t } from "@lingui/core/macro";

import { dialogPlaylistOpenAtom } from "../../atoms/app/dialogs";
import { OktoDialog } from "../Base/OktoDialog";

export function DialogPlaylistEdit() {
  const [open, setOpen] = useAtom(dialogPlaylistOpenAtom);

  const isEdit = true;

  return (
    <OktoDialog
      open={open}
      onClose={() => setOpen(false)}
      title={isEdit ? t`Edit playlist details` : t`Create playlist`}
      showHeader={true}
      transparentPanel={false}
    >
      AAA
    </OktoDialog>
  );
}
