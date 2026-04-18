import { Toast } from "@base-ui/react/toast";

import { PANEL_TOAST_DURATION } from "../constants/toast";

export interface PanelToast {
  readonly message: string;
  readonly type: "success" | "error" | "info";
}

export function usePanelToast(): (toast: PanelToast) => void {
  const toastManager = Toast.useToastManager();

  return (toast) => {
    toastManager.add({
      title: toast.message,
      type: toast.type,
      timeout: PANEL_TOAST_DURATION,
      priority: toast.type === "error" ? "high" : "low",
    });
  };
}
