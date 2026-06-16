import { t } from "@lingui/core/macro";

import { SettingsAdminIndexing } from "./SettingsAdminIndexing";

export function SettingsAdmin() {
  return (
    <div className="flex min-h-full w-full flex-row justify-center">
      <div className="w-4xl p-8">
        <h2 className="mb-8 text-3xl font-bold">{t`Admin Settings`}</h2>
        <SettingsAdminIndexing />
      </div>
    </div>
  );
}
