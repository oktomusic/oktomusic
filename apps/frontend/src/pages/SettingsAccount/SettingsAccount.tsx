import { useAtomValue } from "jotai";
import { t } from "@lingui/core/macro";

import { authSessionAtom } from "../../atoms/auth/atoms";
import { getSexes, SexesKeys } from "../../utils/constants";

export default function SettingsAccount() {
  const user = useAtomValue(authSessionAtom);

  const sexes = getSexes();

  return (
    <div>
      <h2>Account Settings Page</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <form className="flex max-w-32 flex-col">
        <label htmlFor="settings:account:sex">{t`Sexe :`}</label>
        <select id="settings:account:sex">
          {(Object.keys(sexes) as SexesKeys[]).map((key) => (
            <option key={key} value={key}>
              {sexes[key]}
            </option>
          ))}
        </select>
      </form>
    </div>
  );
}
