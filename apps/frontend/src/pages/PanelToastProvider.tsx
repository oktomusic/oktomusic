import { useEffect } from "react";
import { useAtom } from "jotai";
import { HiCheckCircle, HiInformationCircle, HiXCircle } from "react-icons/hi2";

import { panelToastAtom } from "../atoms/app/panels";

const TOAST_DURATION: number = 3000;

export function PanelToastProvider() {
  const [toast, setToast] = useAtom(panelToastAtom);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, TOAST_DURATION);
      return () => clearTimeout(timer);
    }
  }, [setToast, toast]);

  return (
    <div
      id="oktomusic:panel-toast-provider"
      className="flex flex-col items-center justify-end"
    >
      <ul className="pointer-events-auto mb-4 flex w-full max-w-fit flex-col gap-4">
        {toast && (
          <li
            className="flex flex-row gap-2 rounded-lg bg-zinc-800 p-3 shadow-md shadow-black/50"
            onClick={() => setToast(null)}
          >
            {toast?.type === "success" && (
              <HiCheckCircle className="size-6 text-green-400" />
            )}
            {toast?.type === "error" && (
              <HiXCircle className="size-6 text-red-400" />
            )}
            {toast?.type === "info" && (
              <HiInformationCircle className="size-6 text-blue-400" />
            )}
            <span className="ml-2">{toast?.message}</span>
          </li>
        )}
      </ul>
    </div>
  );
}
