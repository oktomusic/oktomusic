import { useMutation, useQuery } from "@apollo/client/react";
import { useAtomValue } from "jotai";
import { t } from "@lingui/core/macro";

import { UPDATE_MY_PROFILE_MUTATION } from "../../api/graphql/mutations/updateMyProfile";
import { ME_QUERY } from "../../api/graphql/queries/me";
import { Role, Sex } from "../../api/graphql/gql/graphql.ts";
import { authSessionAtom } from "../../atoms/auth/atoms";
import { getSexes, SexesKeys } from "../../utils/constants_sexes.ts";
import { OktoListbox } from "../../components/Base/OktoListbox.tsx";

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
        <div className="mb-8 flex w-full items-center gap-4 rounded-lg bg-zinc-800 p-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white">
              {user?.username}
            </h3>
            <p className="text-sm text-zinc-400">
              <time
                dateTime={user!.createdAt.toISOString()}
                title={
                  user!.createdAt
                    ? new Date(user!.createdAt).toLocaleString()
                    : undefined
                }
              >
                {user!.createdAt
                  ? new Date(user!.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                    })
                  : "Unknown"}
              </time>
            </p>
          </div>
          <span
            className={
              "rounded-full px-3 py-1 text-xs font-semibold text-white" +
              (user?.role === Role.Admin ? " bg-green-600" : " bg-blue-600")
            }
          >
            {user?.role === Role.Admin ? "Admin" : "User"}
          </span>
        </div>
        <form className="flex flex-col" aria-busy={loading || isUpdating}>
          <div className="flex h-14 flex-row items-center justify-between py-2">
            <label htmlFor="settings:account:sex">{t`Sexe :`}</label>
            <OktoListbox
              id="settings:account:sex"
              value={currentSexKey}
              onChange={handleSexChange}
              disabled={loading || isUpdating}
              options={sexes}
            />
          </div>
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
