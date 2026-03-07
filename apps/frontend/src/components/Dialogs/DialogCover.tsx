import { useState } from "react";
import { useAtom } from "jotai";
import { CloseButton } from "@headlessui/react";
import { t } from "@lingui/core/macro";

import { dialogCoverId } from "../../atoms/app/dialogs";
import { OktoDialog } from "../Base/OktoDialog";

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
    <OktoDialog
      open={coverDialogId !== null}
      onClose={() => setDialogCoverId(null)}
      showHeader={false}
      transparentPanel={true}
      title={t`Album cover`}
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
      <CloseButton
        className="mt-4 cursor-pointer px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white focus:text-white focus:outline-none"
        onClick={() => setDialogCoverId(null)}
      >
        {t`Close`}
      </CloseButton>
    </OktoDialog>
  );
}
