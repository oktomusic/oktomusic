import { Toast } from "@base-ui/react/toast";

export interface PanelToast {
  readonly message: string;
  readonly type: "success" | "error" | "info";
}

const TOAST_DURATION: number = 3000;

export function usePanelToast(): (toast: PanelToast) => void {
  const toastManager = Toast.useToastManager<PanelToast>();

  return (toast) => {
    toastManager.add({
      title: toast.message,
      type: toast.type,
      timeout: TOAST_DURATION,
      priority: toast.type === "error" ? "high" : "low",
      data: toast,
    });
  };
}
