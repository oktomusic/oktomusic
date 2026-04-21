import { Toast } from "@base-ui/react/toast";

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
      priority: toast.type === "error" ? "high" : "low",
    });
  };
}
