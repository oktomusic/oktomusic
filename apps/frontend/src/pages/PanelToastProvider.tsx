import { type ReactNode } from "react";
import { Toast } from "@base-ui/react/toast";
import { HiCheckCircle, HiInformationCircle, HiXCircle } from "react-icons/hi2";
import { LuX } from "react-icons/lu";

import { type PanelToast } from "../hooks/use_panel_toast";

const TOAST_DURATION: number = 3000;

interface PanelToastProviderProps {
  readonly children: ReactNode;
}

export function PanelToastProvider(props: PanelToastProviderProps) {
  return (
    <Toast.Provider timeout={TOAST_DURATION}>
      {props.children}
      <Toast.Portal>
        <Toast.Viewport
          id="oktomusic:panel-toast-provider"
          className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[calc(100vw-2rem)] max-w-80 flex-col-reverse gap-2"
        >
          <PanelToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function PanelToastList() {
  const { toasts } = Toast.useToastManager<PanelToast>();

  return (
    <>
      {toasts.map((toast) => (
        <Toast.Root
          key={toast.id}
          toast={toast}
          className="pointer-events-auto relative rounded-lg bg-zinc-800 p-3 pr-10 shadow-md shadow-black/50"
        >
          <Toast.Content className="flex items-center gap-2">
            {toast.type === "success" && (
              <HiCheckCircle className="size-6 text-green-400" />
            )}
            {toast.type === "error" && <HiXCircle className="size-6 text-red-400" />}
            {toast.type !== "success" && toast.type !== "error" && (
              <HiInformationCircle className="size-6 text-blue-400" />
            )}
            <Toast.Title className="ml-2" />
            <Toast.Close
              className="rounded p-1 text-zinc-300 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label="Close notification"
            >
              <LuX className="size-4" />
            </Toast.Close>
          </Toast.Content>
        </Toast.Root>
      ))}
    </>
  );
}
