import { t } from "@lingui/core/macro";

import { SettingsAdminIndexing } from "./SettingsAdminIndexing";

export function SettingsAdmin() {
  return (
    <div className="flex min-h-full w-full flex-col items-center">
      <div className="w-4xl p-8 pb-0">
        <h2 className="mb-8 text-3xl font-bold">{t`Admin Settings`}</h2>
        <SettingsAdminIndexing />
      </div>
      <div className="h-0 w-full shrink-0" aria-hidden="true" />
    </div>
  );
}
