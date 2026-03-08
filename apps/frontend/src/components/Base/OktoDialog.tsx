import {
  CloseButton,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { t } from "@lingui/core/macro";
import { HiXMark } from "react-icons/hi2";

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
  return (
    <Dialog open={props.open} onClose={props.onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm duration-300 ease-out data-closed:opacity-0"
      />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className={
            "flex max-w-lg flex-col items-center duration-300 ease-out select-none data-closed:scale-95 data-closed:opacity-0" +
            (props.transparentPanel ? "" : " rounded-lg bg-zinc-900 p-6") +
            (props.className ? " " + props.className : "")
          }
        >
          <div
            className={
              props.showHeader
                ? "mb-4 flex w-full items-center justify-between"
                : "sr-only"
            }
          >
            {props.title && (
              <DialogTitle
                className={
                  props.showHeader ? "text-2xl font-medium" : "sr-only"
                }
              >
                {props.title}
              </DialogTitle>
            )}
            {props.showHeader && (
              <CloseButton
                className="flex size-8 cursor-pointer items-center justify-center text-white/80 transition-colors hover:text-white focus:text-white focus:outline-none"
                title={t`Close`}
              >
                <HiXMark className="size-6" />
              </CloseButton>
            )}
          </div>
          {props.children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
