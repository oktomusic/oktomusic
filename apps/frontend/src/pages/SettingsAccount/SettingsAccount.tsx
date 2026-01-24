import type { ChangeEvent } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import { useAtomValue } from "jotai";
import { t } from "@lingui/core/macro";

import { UPDATE_MY_PROFILE_MUTATION } from "../../api/graphql/mutations/updateMyProfile";
import { ME_QUERY } from "../../api/graphql/queries/me";
import { Sex } from "../../api/graphql/gql/graphql.ts";
import { authSessionAtom } from "../../atoms/auth/atoms";
import { getSexes, SexesKeys } from "../../utils/constants_sexes.ts";

function mapSexKeyToGraphql(value: SexesKeys): Sex | null {
  if (value === "unspecified") {
    return null;
  }

  return value === "XX" ? Sex.Xx : Sex.Xy;
}

export default function SettingsAccount() {
  const { user } = useAtomValue(authSessionAtom);
  const { data, loading, error } = useQuery(ME_QUERY, {
    fetchPolicy: "cache-and-network",
  });
  const [updateMyProfile, { loading: isUpdating, error: updateError }] =
    useMutation(UPDATE_MY_PROFILE_MUTATION, {
      refetchQueries: [{ query: ME_QUERY }],
    });

  const sexes = getSexes();
  const currentSexKey = (data?.me?.sex ?? "unspecified") as SexesKeys;

  const handleSexChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const value = event.target.value as SexesKeys;
    const nextSex = mapSexKeyToGraphql(value);

    void updateMyProfile({
      variables: { input: { sex: nextSex } },
    });
  };

  return (
    <div>
      <h2>Account Settings Page</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <form
        className="flex max-w-32 flex-col"
        aria-busy={loading || isUpdating}
      >
        <label htmlFor="settings:account:sex">{t`Sexe :`}</label>
        <select
          id="settings:account:sex"
          value={currentSexKey}
          onChange={handleSexChange}
          disabled={loading || isUpdating}
        >
          {(Object.keys(sexes) as SexesKeys[]).map((key) => (
            <option key={key} value={key}>
              {sexes[key]}
            </option>
          ))}
        </select>
        {(error || updateError) && (
          <p role="status" className="text-red-600">
            {error?.message ?? updateError?.message}
          </p>
        )}
      </form>
    </div>
  );
}
