import { useSetAtom } from "jotai";
import { t } from "@lingui/core/macro";

import { panelToastAtom } from "../atoms/app/panels";

/**
 * Share a URL either with the Web Share API if available, or by copying it to the clipboard as a fallback.
 *
 * Do user feedback with the toast system.
 *
 * @param url - The URL to share.
 * @param title - The title to share (optional, used by Web Share API).
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API
 * @see https://w3c.github.io/web-share
 * @see https://web.dev/articles/web-share
 */
export function useShare(
  url: string | undefined,
  title: string | undefined,
): () => void {
  const setToast = useSetAtom(panelToastAtom);

  return function () {
    if (!url || !title) {
      return;
    }

    if (navigator.share && typeof navigator.share === "function") {
      navigator
        .share({
          title: title,
          url: url,
        })
        .catch(() => {
          setToast({
            type: "error",
            message: t`Failed to share`,
          });
        });
    } else {
      void navigator.clipboard.writeText(url);
      setToast({
        type: "success",
        message: t`Link copied to clipboard`,
      });
    }
  };
}
