import { useState } from "react";
import { useAtom } from "jotai";
import { Button, Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { t } from "@lingui/core/macro";

import { dialogCoverId } from "../../atoms/app/dialogs";

export function DialogCover() {
  const [coverDialogId, setDialogCoverId] = useAtom(dialogCoverId);
  const [cachedCoverId, setCachedCoverId] = useState<string | null>(null);

  // Adjust cached state during render (documented React pattern for syncing derived state).
  // This ensures the cover image persists during the closing transition.
  if (coverDialogId !== null && coverDialogId !== cachedCoverId) {
    setCachedCoverId(coverDialogId);
  }

  const displayCoverId = coverDialogId ?? cachedCoverId;

  return (
    <Dialog
      open={coverDialogId !== null}
      onClose={() => setDialogCoverId(null)}
      className="relative z-50"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm duration-300 ease-out data-closed:opacity-0"
      />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className="flex max-w-lg flex-col items-center duration-300 ease-out select-none data-closed:scale-95 data-closed:opacity-0"
        >
          {displayCoverId && (
            <img
              src={`/api/album/${displayCoverId}/cover/1280`}
              className="w-full rounded-lg shadow-2xl"
              alt={t`Album cover`}
              loading="eager"
              fetchPriority="high"
            />
          )}
          <Button
            className="mt-4 cursor-pointer px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white focus:text-white focus:outline-none"
            onClick={() => setDialogCoverId(null)}
          >
            {t`Close`}
          </Button>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
