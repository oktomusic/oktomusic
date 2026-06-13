import { useAtomValue } from "jotai";

import { authSessionAtom } from "../../atoms/auth/atoms";
import { Role } from "../../api/graphql/gql/graphql";
import { OktoBadge } from "../../components/Base/OktoBadge";

export function SettingsAccountHeader() {
  const { user } = useAtomValue(authSessionAtom);

  return (
    <div className="mb-8 flex w-full items-center gap-4 rounded-lg bg-zinc-800 p-4">
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-white">{user?.username}</h3>
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
      <OktoBadge color={user?.role === Role.Admin ? "green" : "blue"}>
        {user?.role === Role.Admin ? "Admin" : "User"}
      </OktoBadge>
    </div>
  );
}
