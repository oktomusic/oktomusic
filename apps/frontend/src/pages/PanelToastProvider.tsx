import { Toast } from "@base-ui/react/toast";
import { HiCheckCircle, HiInformationCircle, HiXCircle } from "react-icons/hi2";

export function PanelToastProvider() {
  return (
    <Toast.Portal>
      <Toast.Viewport className="pointer-events-none fixed bottom-28 left-1/2 z-50 flex w-[calc(100vw-2rem)] max-w-96 -translate-x-1/2 flex-col-reverse gap-2">
        <PanelToastList />
      </Toast.Viewport>
    </Toast.Portal>
  );
}

function PanelToastList() {
  const { toasts } = Toast.useToastManager();

  return (
    <>
      {toasts.map((toast) => (
        <Toast.Root
          key={toast.id}
          toast={toast}
          role="status"
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          aria-labelledby={`oktomusic:toast-title:${toast.id}`}
          className="pointer-events-auto relative rounded-lg bg-zinc-800 p-3 pr-10 shadow-md shadow-black/50"
        >
          <Toast.Content className="flex items-center gap-2">
            {toast.type === "success" && (
              <HiCheckCircle className="size-6 text-green-400" />
            )}
            {toast.type === "error" && (
              <HiXCircle className="size-6 text-red-400" />
            )}
            {toast.type === "info" && (
              <HiInformationCircle className="size-6 text-blue-400" />
            )}
            <Toast.Title
              id={`oktomusic:toast-title:${toast.id}`}
              className="ml-2"
            >
              {toast.title}
            </Toast.Title>
          </Toast.Content>
        </Toast.Root>
      ))}
    </>
  );
}
