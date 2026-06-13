import { useMutation, useQuery } from "@apollo/client/react";
import { t } from "@lingui/core/macro";

import { UPDATE_MY_PROFILE_MUTATION } from "../../api/graphql/mutations/updateMyProfile";
import { ME_QUERY } from "../../api/graphql/queries/me";
import { Sex } from "../../api/graphql/gql/graphql.ts";
import { getSexes, SexesKeys } from "../../utils/constants_sexes.ts";
import {
  OktoListbox,
  OktoListboxItem,
} from "../../components/Base/OktoListbox.tsx";
import { SettingsAccountPlaybackHistory } from "./SettingsAccountPlaybackHistory.tsx";
import { SettingsAccountHeader } from "./SettingsAccountHeader.tsx";

function mapSexKeyToGraphql(value: SexesKeys): Sex | null {
  if (value === "unspecified") {
    return null;
  }

  return value === "XX" ? Sex.Xx : Sex.Xy;
}

function mapGraphqlSexToKey(value: Sex | null | undefined): SexesKeys {
  if (value === Sex.Xx) {
    return "XX";
  }

  if (value === Sex.Xy) {
    return "XY";
  }

  return "unspecified";
}

export function SettingsAccount() {
  const { data, loading, error } = useQuery(ME_QUERY, {
    fetchPolicy: "cache-and-network",
  });
  const [updateMyProfile, { loading: isUpdating, error: updateError }] =
    useMutation(UPDATE_MY_PROFILE_MUTATION, {
      refetchQueries: [{ query: ME_QUERY }],
    });

  const sexes = getSexes();
  const sexKeys: readonly SexesKeys[] = ["unspecified", "XX", "XY"];
  const sexOptions: readonly OktoListboxItem<SexesKeys>[] = sexKeys.map(
    (key) => ({
      value: key,
      label: sexes[key],
    }),
  );
  const currentSexKey = mapGraphqlSexToKey(data?.me?.sex);

  const handleSexChange = (value: SexesKeys): void => {
    const nextSex = mapSexKeyToGraphql(value);

    void updateMyProfile({
      variables: { input: { sex: nextSex } },
    });
  };

  return (
    <div className="flex min-h-full w-full flex-row justify-center">
      <div className="w-4xl p-8">
        <h2 className="mb-8 text-3xl font-bold">{t`Account Settings`}</h2>
        <SettingsAccountHeader />
        <form className="flex flex-col" aria-busy={loading || isUpdating}>
          <div className="flex h-14 flex-row items-center justify-between py-2">
            <label htmlFor="settings:account:sex">{t`Sexe :`}</label>
            <OktoListbox
              id="settings:account:sex"
              value={currentSexKey}
              onChange={handleSexChange}
              disabled={loading || isUpdating}
              options={sexOptions}
            />
          </div>
          <SettingsAccountPlaybackHistory />
          {(error || updateError) && (
            <p role="status" className="text-red-600">
              {error?.message ?? updateError?.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
