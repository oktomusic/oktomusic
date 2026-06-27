import { Dialog } from "@base-ui/react/dialog";
import { useLingui } from "@lingui/react/macro";
import { LuX } from "react-icons/lu";

interface OktoDialogProps {
  /**
   * Whether the dialog is open or closed.
   */
  readonly open: boolean;
  /**
   * Callback function triggered when the dialog should be closed.
   */
  readonly onClose: () => void;
  /**
   * Whether to show the header (title and close button) of the dialog.
   *
   * Defaults to `false` for maximum flexibility.
   */
  readonly showHeader?: boolean;
  /**
   * The title to display in the dialog header.
   *
   * If `showHeader` is `false`, the title will still be added for accessibility purposes but hidden with `sr-only`.
   */
  readonly title: string;
  /**
   * Whether to apply the default background and padding to the dialog panel.
   *
   * Defaults to `false` for maximum flexibility.
   */
  readonly transparentPanel?: boolean;
  /**
   * Custom className to apply to the dialog panel.
   */
  readonly className?: string;
  /**
   * The content to display inside the dialog.
   */
  readonly children: React.ReactNode;
}

/**
 * A flexible dialog component built on top of Headless UI's Dialog.
 *
 * Provides a customizable modal dialog with optional header, title, and close button.
 * The dialog supports both transparent and styled panel options.
 */
export function OktoDialog(props: OktoDialogProps) {
  const { t } = useLingui();

  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={(open) => !open && props.onClose()}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          className={`fixed top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-4 p-4 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 ${
            props.transparentPanel ? "" : "rounded-lg bg-zinc-900 p-6"
          } ${props.className ?? ""} `}
        >
          <div
            className={
              props.showHeader
                ? "mb-4 flex w-full items-center justify-between"
                : "sr-only"
            }
          >
            {props.title && (
              <Dialog.Title
                className={
                  props.showHeader ? "text-2xl font-medium" : "sr-only"
                }
              >
                {props.title}
              </Dialog.Title>
            )}
            {props.showHeader && (
              <Dialog.Close
                className="flex size-8 cursor-pointer items-center justify-center text-white/80 transition-colors hover:text-white focus:text-white focus:outline-none"
                title={t`Close`}
              >
                <LuX className="size-6" />
              </Dialog.Close>
            )}
          </div>
          {props.children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
