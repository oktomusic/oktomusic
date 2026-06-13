import { t } from "@lingui/core/macro";
import { useMutation } from "@apollo/client/react";

import { OktoButton } from "../../components/Base/OktoButton";
import { usePanelToast } from "../../hooks/use_panel_toast";
import { CLEAN_ITEM_PLAY_MUTATION } from "../../api/graphql/mutations/cleanItemPlay";

export function SettingsAccountPlaybackHistory() {
  const [cleanItemPlay, { loading: isClearingHistory }] = useMutation(
    CLEAN_ITEM_PLAY_MUTATION,
  );
  const setToast = usePanelToast();

  const handleClearPlayedItemsHistory = (): void => {
    if (!window.confirm(t`Clear all played items history?`)) {
      return;
    }

    void cleanItemPlay()
      .then(() => {
        setToast({
          message: t`Played items history cleared`,
          type: "success",
        });
      })
      .catch((error: unknown) => {
        console.error("Failed to clear played items history:", error);
        setToast({
          message: t`Failed to clear played items history`,
          type: "error",
        });
      });
  };

  return (
    <div className="flex h-14 flex-row items-center justify-between py-2">
      <span>{t`Played items history:`}</span>
      <OktoButton
        type="button"
        onClick={handleClearPlayedItemsHistory}
        disabled={isClearingHistory}
        className="disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isClearingHistory ? t`Clearing...` : t`Clear history`}
      </OktoButton>
    </div>
  );
}
