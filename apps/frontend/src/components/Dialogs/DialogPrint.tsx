import { useCallback, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLingui } from "@lingui/react/macro";
import { useAtom } from "jotai";
import { LuPrinter } from "react-icons/lu";

import { dialogAlbumPlaylistPrintAtom } from "../../atoms/app/dialogs";
import { cloneStyles } from "../../utils/styles";
import { OktoButton } from "../Base/OktoButton";
import { OktoDialog } from "../Base/OktoDialog";
import { DialogPrintViewport } from "./DialogPrintViewport";

export function DialogPrint() {
  const { t } = useLingui();

  const [printDialogOpen, setPrintDialogOpen] = useAtom(
    dialogAlbumPlaylistPrintAtom,
  );

  const [printContainer, setPrintContainer] = useState<HTMLElement | null>(
    null,
  );
  const setPrintIframe = useCallback((iframe: HTMLIFrameElement | null) => {
    // The initial about:blank load can finish before React attaches onLoad.
    setPrintContainer(iframe?.contentDocument?.body ?? null);
  }, []);

  useLayoutEffect(() => {
    if (printContainer) {
      cloneStyles(document, printContainer.ownerDocument);
    }
  }, [printContainer]);

  return (
    <OktoDialog
      open={printDialogOpen !== null}
      onClose={() => setPrintDialogOpen(null)}
      showHeader={true}
      transparentPanel={false}
      title={
        printDialogOpen?.subject.__typename === "PlaylistBasic"
          ? t`Print playlist`
          : t`Print album`
      }
      className="w-lg"
    >
      {printContainer &&
        printDialogOpen &&
        createPortal(
          <DialogPrintViewport
            subject={printDialogOpen.subject}
            colors={printDialogOpen.colors}
          />,
          printContainer,
        )}
      <iframe
        ref={setPrintIframe}
        title={t`Print preview`}
        className="aspect-70/99"
        onLoad={(event) => {
          setPrintContainer(event.currentTarget.contentDocument?.body ?? null);
        }}
      />
      <div className="flex flex-row justify-end">
        <OktoButton
          className="flex flex-row items-center gap-2"
          onClick={() => printContainer?.ownerDocument.defaultView?.print()}
        >
          <LuPrinter />
          Print
        </OktoButton>
      </div>
    </OktoDialog>
  );
}
